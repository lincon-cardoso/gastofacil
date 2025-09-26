import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    userId?: string;
    user: DefaultSession["user"] & {
      role?: Role;
      plan?: {
        id: string;
        name: string;
        price: number;
      };
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    role?: Role;
    jti?: string;
    plan?: {
      id: string;
      name: string;
      price: number;
    };
  }
}
