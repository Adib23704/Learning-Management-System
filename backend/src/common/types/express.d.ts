declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: "SUPER_ADMIN" | "ADMIN" | "INSTRUCTOR" | "STUDENT";
      };
      id?: string;
    }
  }
}

export type AppRole = "SUPER_ADMIN" | "ADMIN" | "INSTRUCTOR" | "STUDENT";
