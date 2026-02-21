import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies before importing the service
vi.mock("../../common/utils/token.js", () => ({
  signAccessToken: vi.fn().mockReturnValue("mock-access-token"),
  generateRefreshToken: vi.fn().mockReturnValue("mock-refresh-token"),
  hashToken: vi.fn((t: string) => `hashed-${t}`),
  verifyAccessToken: vi.fn(),
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed-password"),
    compare: vi.fn(),
  },
}));

vi.mock("./auth.repository.js", () => ({
  authRepository: {
    findByEmail: vi.fn(),
    createUser: vi.fn(),
    findById: vi.fn(),
    updateUser: vi.fn(),
    updatePassword: vi.fn(),
    getPasswordById: vi.fn(),
    createRefreshToken: vi.fn(),
    findRefreshToken: vi.fn(),
    deleteRefreshToken: vi.fn(),
    deleteAllUserTokens: vi.fn(),
    deleteExpiredTokens: vi.fn(),
    countUserTokens: vi.fn(),
  },
}));

import bcrypt from "bcrypt";
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} from "../../common/errors/index.js";
import { authRepository } from "./auth.repository.js";
import { authService } from "./auth.service.js";

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  role: "STUDENT" as const,
  isActive: true,
  avatarUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUserWithPassword = {
  ...mockUser,
  password: "hashed-password",
};

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("register", () => {
    it("should create a new user and return tokens", async () => {
      vi.mocked(authRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(authRepository.createUser).mockResolvedValue(mockUser);
      vi.mocked(authRepository.createRefreshToken).mockResolvedValue({} as any);

      const result = await authService.register({
        email: "test@example.com",
        password: "password123",
        firstName: "Test",
        lastName: "User",
        role: "STUDENT",
      });

      expect(result.user).toEqual(mockUser);
      expect(result.accessToken).toBe("mock-access-token");
      expect(result.refreshToken).toBe("mock-refresh-token");
      expect(authRepository.findByEmail).toHaveBeenCalledWith(
        "test@example.com",
      );
      expect(authRepository.createUser).toHaveBeenCalled();
    });

    it("should throw ConflictError if email exists", async () => {
      vi.mocked(authRepository.findByEmail).mockResolvedValue(
        mockUserWithPassword,
      );

      await expect(
        authService.register({
          email: "test@example.com",
          password: "password123",
          firstName: "Test",
          lastName: "User",
          role: "STUDENT",
        }),
      ).rejects.toThrow(ConflictError);
    });
  });

  describe("login", () => {
    it("should return user and tokens on valid credentials", async () => {
      vi.mocked(authRepository.findByEmail).mockResolvedValue(
        mockUserWithPassword,
      );
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(authRepository.deleteExpiredTokens).mockResolvedValue(
        {} as any,
      );
      vi.mocked(authRepository.countUserTokens).mockResolvedValue(0);
      vi.mocked(authRepository.createRefreshToken).mockResolvedValue({} as any);

      const result = await authService.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(result.user.email).toBe("test@example.com");
      expect(result.accessToken).toBe("mock-access-token");
      expect(result.refreshToken).toBe("mock-refresh-token");
      expect(result.user).not.toHaveProperty("password");
    });

    it("should throw UnauthorizedError for wrong password", async () => {
      vi.mocked(authRepository.findByEmail).mockResolvedValue(
        mockUserWithPassword,
      );
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        authService.login({
          email: "test@example.com",
          password: "wrong",
        }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it("should throw UnauthorizedError for nonexistent email", async () => {
      vi.mocked(authRepository.findByEmail).mockResolvedValue(null);

      await expect(
        authService.login({
          email: "nobody@example.com",
          password: "password123",
        }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it("should throw UnauthorizedError for suspended account", async () => {
      vi.mocked(authRepository.findByEmail).mockResolvedValue({
        ...mockUserWithPassword,
        isActive: false,
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      await expect(
        authService.login({
          email: "test@example.com",
          password: "password123",
        }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it("should delete all tokens when max reached", async () => {
      vi.mocked(authRepository.findByEmail).mockResolvedValue(
        mockUserWithPassword,
      );
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(authRepository.deleteExpiredTokens).mockResolvedValue(
        {} as any,
      );
      vi.mocked(authRepository.countUserTokens).mockResolvedValue(5);
      vi.mocked(authRepository.deleteAllUserTokens).mockResolvedValue(
        {} as any,
      );
      vi.mocked(authRepository.createRefreshToken).mockResolvedValue({} as any);

      await authService.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(authRepository.deleteAllUserTokens).toHaveBeenCalledWith("user-1");
    });
  });

  describe("refresh", () => {
    it("should rotate tokens on valid refresh", async () => {
      vi.mocked(authRepository.findRefreshToken).mockResolvedValue({
        id: "rt-1",
        token: "hashed-token",
        userId: "user-1",
        expiresAt: new Date(Date.now() + 86400000),
        createdAt: new Date(),
        user: mockUser,
      });
      vi.mocked(authRepository.deleteRefreshToken).mockResolvedValue({} as any);
      vi.mocked(authRepository.createRefreshToken).mockResolvedValue({} as any);

      const result = await authService.refresh("old-refresh-token");

      expect(result.accessToken).toBe("mock-access-token");
      expect(result.refreshToken).toBe("mock-refresh-token");
      expect(authRepository.deleteRefreshToken).toHaveBeenCalledWith(
        "old-refresh-token",
      );
      expect(authRepository.createRefreshToken).toHaveBeenCalled();
    });

    it("should throw UnauthorizedError for invalid token", async () => {
      vi.mocked(authRepository.findRefreshToken).mockResolvedValue(null);

      await expect(authService.refresh("invalid-token")).rejects.toThrow(
        UnauthorizedError,
      );
    });

    it("should throw UnauthorizedError for expired token", async () => {
      vi.mocked(authRepository.findRefreshToken).mockResolvedValue({
        id: "rt-1",
        token: "hashed-token",
        userId: "user-1",
        expiresAt: new Date(Date.now() - 86400000), // expired
        createdAt: new Date(),
        user: mockUser,
      });
      vi.mocked(authRepository.deleteRefreshToken).mockResolvedValue({} as any);

      await expect(
        authService.refresh("expired-refresh-token"),
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe("logout", () => {
    it("should delete the refresh token", async () => {
      vi.mocked(authRepository.deleteRefreshToken).mockResolvedValue({} as any);

      await authService.logout("some-token");

      expect(authRepository.deleteRefreshToken).toHaveBeenCalledWith(
        "some-token",
      );
    });
  });

  describe("changePassword", () => {
    it("should update password and delete all tokens", async () => {
      vi.mocked(authRepository.getPasswordById).mockResolvedValue(
        "hashed-password",
      );
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(authRepository.updatePassword).mockResolvedValue({} as any);
      vi.mocked(authRepository.deleteAllUserTokens).mockResolvedValue(
        {} as any,
      );

      await authService.changePassword("user-1", {
        currentPassword: "old-pass",
        newPassword: "new-pass-123",
      });

      expect(authRepository.updatePassword).toHaveBeenCalledWith(
        "user-1",
        "hashed-password",
      );
      expect(authRepository.deleteAllUserTokens).toHaveBeenCalledWith("user-1");
    });

    it("should throw BadRequestError for wrong current password", async () => {
      vi.mocked(authRepository.getPasswordById).mockResolvedValue(
        "hashed-password",
      );
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        authService.changePassword("user-1", {
          currentPassword: "wrong",
          newPassword: "new-pass-123",
        }),
      ).rejects.toThrow(BadRequestError);
    });
  });
});
