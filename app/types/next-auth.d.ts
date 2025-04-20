// types/next-auth.d.ts
import type { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      phone?: string;
      birthDate?: string;
      gender?: string;
      stars?: number;
      isAdmin?: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id?: string;
    isAdmin?: boolean;
    stars?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    phone?: string;
    birthDate?: string;
    gender?: string;
    stars?: number;
    isAdmin?: boolean;
  }
}