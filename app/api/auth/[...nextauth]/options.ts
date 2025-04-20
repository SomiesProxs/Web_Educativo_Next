// app/api/auth/[...nextauth]/options.ts
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
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
        const adminCollection = db.collection("Admins");
  
        const emailLowerCase = user.email.toLowerCase();
        const existingUser = await usersCollection.findOne({ email: emailLowerCase });
        const isAdmin = await adminCollection.findOne({ email: emailLowerCase });
  
        // Si no es cliente pero es admin, crear como cliente
        if (!existingUser && isAdmin) {
          await usersCollection.insertOne({
            _id: new ObjectId(),
            username: user.name,
            email: emailLowerCase,
            image: user.image || null,
            phone: "",
            birthDate: "",
            gender: "",
            stars: 50,
            createdAt: new Date(),
          });
        }
  
        // Si es Google y nuevo usuario cliente
        if (!existingUser && account?.provider === "google") {
          await usersCollection.insertOne({
            _id: new ObjectId(),
            username: user.name,
            email: emailLowerCase,
            image: user.image || null,
            phone: "",
            birthDate: "",
            gender: "",
            stars: 20,
            createdAt: new Date(),
          });
        }
  
        return true;
      },
  
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
          token.email = user.email;
          token.stars = 20;
        }
  
        if (token.email) {
          const client = await clientPromise;
          const db = client.db(process.env.MONGODB_DB);
          const usersCollection = db.collection("Clientes");
          const adminCollection = db.collection("Admins");
  
          const userData = await usersCollection.findOne({ email: token.email });
          const isAdmin = await adminCollection.findOne({ email: token.email });
  
          if (userData) {
            token.id = userData._id.toString();
            token.name = userData.username || userData.name;
            token.phone = userData.phone || "";
            token.birthDate = userData.birthDate || "";
            token.gender = userData.gender || "";
            token.stars = userData.stars || 20;
          }
  
          token.isAdmin = !!isAdmin;
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
          session.user.isAdmin = token.isAdmin as boolean;
        }
        return session;
      },
    },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
};