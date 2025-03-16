import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      phone?: string; // Agregado
      birthDate?: string; // Agregado
      gender?: string; // Agregado
      stars?: number; // Se agrega la propiedad "stars"
    } & DefaultSession["user"];
  }
}
