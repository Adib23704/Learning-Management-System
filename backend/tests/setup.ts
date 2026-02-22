import { afterAll, beforeAll, vi } from "vitest";

// Mock Prisma globally
vi.mock("../src/config/database.js", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

beforeAll(async () => {
  // Global test setup
});

afterAll(async () => {
  vi.restoreAllMocks();
});
