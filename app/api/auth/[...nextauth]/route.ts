// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    // Añadir proveedor de credenciales para el login con email
    CredentialsProvider({
      name: "Email Verification",
      credentials: {
        email: { label: "Email", type: "email" },
        verified: { label: "Verified", type: "boolean" }
      },
      async authorize(credentials) {
        if (!credentials?.email || credentials?.verified !== "true") {
          return null;
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        const usersCollection = db.collection("Clientes");
        
        const user = await usersCollection.findOne({ email: credentials.email.toLowerCase() });
        
        if (!user) return null;
        
        return {
          id: user._id.toString(),
          name: user.username || user.name || "Usuario",
          email: user.email,
          image: user.image || null,
        };
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user || !user.email) return false;
    
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB);
      const usersCollection = db.collection("Clientes");
    
      const emailLowerCase = user.email.toLowerCase();
      const existingUser = await usersCollection.findOne({ email: emailLowerCase });
    
      // Si es un nuevo usuario y viene de Google, guardarlo en la base de datos
      if (!existingUser && account?.provider === "google") {
        const newUser = {
          _id: new ObjectId(),
          username: user.name,
          email: emailLowerCase,
          image: user.image || null,
          phone: "",
          birthDate: "",
          gender: "",
          stars: 20,
          createdAt: new Date(),
        };
        await usersCollection.insertOne(newUser);
      }
    
      // Permitir el inicio de sesión independientemente de si el usuario existe o no
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.stars = 20;
      }

      // Obtener datos adicionales del usuario desde MongoDB
      if (token.email) {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        const usersCollection = db.collection("Clientes");
        const userData = await usersCollection.findOne({ email: token.email });

        if (userData) {
          token.id = userData._id.toString();
          token.name = userData.username || userData.name;
          token.phone = userData.phone || "";
          token.birthDate = userData.birthDate || "";
          token.gender = userData.gender || "";
          token.stars = userData.stars || 20;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.stars = token.stars as number;
        session.user.phone = token.phone as string;
        session.user.birthDate = token.birthDate as string;
        session.user.gender = token.gender as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
  
  // Aumentar tiempo de sesión a 30 días
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
});

export { handler as GET, handler as POST };