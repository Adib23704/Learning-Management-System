import bcrypt from "bcrypt";
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} from "../../common/errors/index.js";
import {
  generateRefreshToken,
  signAccessToken,
} from "../../common/utils/token.js";
import type {
  ChangePasswordInput,
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
} from "./auth.dto.js";
import { authRepository } from "./auth.repository.js";

const SALT_ROUNDS = 12;
const MAX_TOKENS_PER_USER = 5;
const REFRESH_TOKEN_DAYS = 7;

function getRefreshExpiry(): Date {
  const d = new Date();
  d.setDate(d.getDate() + REFRESH_TOKEN_DAYS);
  return d;
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await authRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError("Email is already registered");
    }

    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await authRepository.createUser({
      ...input,
      hashedPassword,
    });

    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken();
    await authRepository.createRefreshToken(
      user.id,
      refreshToken,
      getRefreshExpiry(),
    );

    return { user, accessToken, refreshToken };
  },

  async login(input: LoginInput) {
    const user = await authRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("Account has been suspended");
    }

    await authRepository.deleteExpiredTokens(user.id);

    const tokenCount = await authRepository.countUserTokens(user.id);
    if (tokenCount >= MAX_TOKENS_PER_USER) {
      await authRepository.deleteAllUserTokens(user.id);
    }

    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken();
    await authRepository.createRefreshToken(
      user.id,
      refreshToken,
      getRefreshExpiry(),
    );

    const { password: _, ...safeUser } = user;

    return { user: safeUser, accessToken, refreshToken };
  },

  async refresh(rawToken: string) {
    const record = await authRepository.findRefreshToken(rawToken);

    if (!record) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    if (record.expiresAt < new Date()) {
      await authRepository.deleteRefreshToken(rawToken);
      throw new UnauthorizedError("Refresh token has expired");
    }

    if (!record.user.isActive) {
      await authRepository.deleteAllUserTokens(record.userId);
      throw new UnauthorizedError("Account has been suspended");
    }

    await authRepository.deleteRefreshToken(rawToken);

    const accessToken = signAccessToken(record.user.id, record.user.role);
    const newRefreshToken = generateRefreshToken();
    await authRepository.createRefreshToken(
      record.user.id,
      newRefreshToken,
      getRefreshExpiry(),
    );

    return { user: record.user, accessToken, refreshToken: newRefreshToken };
  },

  async logout(rawToken: string) {
    await authRepository.deleteRefreshToken(rawToken);
  },

  async getMe(userId: string) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError("User not found");
    }
    return user;
  },

  async updateProfile(userId: string, input: UpdateProfileInput) {
    return authRepository.updateUser(userId, input);
  },

  async changePassword(userId: string, input: ChangePasswordInput) {
    const currentHash = await authRepository.getPasswordById(userId);
    if (!currentHash) {
      throw new UnauthorizedError("User not found");
    }

    const valid = await bcrypt.compare(input.currentPassword, currentHash);
    if (!valid) {
      throw new BadRequestError("Current password is incorrect");
    }

    const newHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
    await authRepository.updatePassword(userId, newHash);

    await authRepository.deleteAllUserTokens(userId);
  },
};
