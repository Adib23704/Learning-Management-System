import type { Prisma, Role } from "@prisma/client";
import { prisma } from "../../config/database.js";
import type { UserQueryInput } from "./user.dto.js";

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

export const userRepository = {
  async findMany(query: UserQueryInput) {
    const where: Prisma.UserWhereInput = {};

    if (query.role) where.role = query.role;
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: "insensitive" } },
        { lastName: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const take = query.limit + 1;
    const users = await prisma.user.findMany({
      where,
      select: userSelect,
      orderBy: { [query.sortBy]: query.sortOrder },
      take,
      ...(query.cursor && { cursor: { id: query.cursor }, skip: 1 }),
    });

    const hasMore = users.length > query.limit;
    const data = hasMore ? users.slice(0, -1) : users;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return { data, meta: { nextCursor, hasMore } };
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
  },

  async create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
  }) {
    return prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role as "ADMIN" | "INSTRUCTOR" | "STUDENT",
      },
      select: userSelect,
    });
  },

  async update(
    id: string,
    data: Partial<{
      firstName: string;
      lastName: string;
      role: Role;
      isActive: boolean;
    }>,
  ) {
    return prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    });
  },
};
