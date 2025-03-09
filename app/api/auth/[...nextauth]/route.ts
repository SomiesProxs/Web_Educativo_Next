import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import clientPromise from "@/lib/mongodb";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user || !user.email) return false;

      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB);
      const usersCollection = db.collection("Clientes");

      const userData = {
        name: user.name,
        email: user.email,
        image: user.image || null,
      };

      const existingUser = await usersCollection.findOne({ email: user.email });

      if (!existingUser) {
        await usersCollection.insertOne(userData);
      }

      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.email = token.email ?? "";
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email ?? "";
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
