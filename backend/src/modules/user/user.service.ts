import type { Role } from "@prisma/client";
import bcrypt from "bcrypt";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../common/errors/index.js";
import type { AppRole } from "../../common/types/express.js";
import type {
  CreateUserInput,
  UpdateUserInput,
  UserQueryInput,
} from "./user.dto.js";
import { userRepository } from "./user.repository.js";

const SALT_ROUNDS = 12;

export const userService = {
  async list(query: UserQueryInput) {
    return userRepository.findMany(query);
  },

  async getById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError("User");
    return user;
  },

  async create(input: CreateUserInput, creatorRole: AppRole) {
    if (input.role === "ADMIN" && creatorRole !== "SUPER_ADMIN") {
      throw new ForbiddenError("Only Super Admin can create admin accounts");
    }

    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError("Email is already registered");
    }

    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);
    return userRepository.create({
      ...input,
      password: hashedPassword,
    });
  },

  async update(id: string, input: UpdateUserInput, actorRole: AppRole) {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError("User");

    if (user.role === "SUPER_ADMIN" && actorRole !== "SUPER_ADMIN") {
      throw new ForbiddenError("Cannot modify Super Admin accounts");
    }

    if (input.role === "ADMIN" && actorRole !== "SUPER_ADMIN") {
      throw new ForbiddenError("Only Super Admin can assign admin role");
    }

    return userRepository.update(id, {
      ...input,
      role: input.role as Role | undefined,
    });
  },

  async suspend(id: string, actorRole: AppRole) {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError("User");

    if (user.role === "SUPER_ADMIN") {
      throw new ForbiddenError("Cannot suspend Super Admin");
    }
    if (user.role === "ADMIN" && actorRole !== "SUPER_ADMIN") {
      throw new ForbiddenError("Only Super Admin can suspend admins");
    }

    return userRepository.update(id, { isActive: false });
  },

  async activate(id: string, actorRole: AppRole) {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError("User");

    if (user.role === "ADMIN" && actorRole !== "SUPER_ADMIN") {
      throw new ForbiddenError("Only Super Admin can activate admins");
    }

    return userRepository.update(id, { isActive: true });
  },
};
