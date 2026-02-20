import { hashToken } from "../../common/utils/token.js";
import { prisma } from "../../config/database.js";
import type { RegisterInput } from "./auth.dto.js";

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  isActive: true,
  avatarUrl: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const authRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
  },

  async createUser(data: RegisterInput & { hashedPassword: string }) {
    return prisma.user.create({
      data: {
        email: data.email,
        password: data.hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      },
      select: userSelect,
    });
  },

  async updateUser(id: string, data: Record<string, unknown>) {
    return prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    });
  },

  async updatePassword(id: string, hashedPassword: string) {
    return prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  },

  async getPasswordById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { password: true },
    });
    return user?.password ?? null;
  },

  // Refresh token operations
  async createRefreshToken(userId: string, rawToken: string, expiresAt: Date) {
    const hashed = hashToken(rawToken);
    return prisma.refreshToken.create({
      data: { token: hashed, userId, expiresAt },
    });
  },

  async findRefreshToken(rawToken: string) {
    const hashed = hashToken(rawToken);
    return prisma.refreshToken.findUnique({
      where: { token: hashed },
      include: { user: { select: userSelect } },
    });
  },

  async deleteRefreshToken(rawToken: string) {
    const hashed = hashToken(rawToken);
    return prisma.refreshToken.deleteMany({
      where: { token: hashed },
    });
  },

  async deleteAllUserTokens(userId: string) {
    return prisma.refreshToken.deleteMany({
      where: { userId },
    });
  },

  async deleteExpiredTokens(userId: string) {
    return prisma.refreshToken.deleteMany({
      where: { userId, expiresAt: { lt: new Date() } },
    });
  },

  async countUserTokens(userId: string) {
    return prisma.refreshToken.count({
      where: { userId, expiresAt: { gt: new Date() } },
    });
  },
};
