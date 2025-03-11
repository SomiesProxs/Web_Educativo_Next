import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import clientPromise from "@/lib/mongodb";

// Configuración de NextAuth con el proveedor de Google
const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string, // ID del cliente de Google (obtenido desde las credenciales de Google)
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, // Secreto del cliente de Google
    }),
  ],
  callbacks: {
    // Callback que se ejecuta cuando un usuario intenta iniciar sesión
    async signIn({ user }) {
      if (!user || !user.email) return false; // Si no hay usuario o email, se rechaza la autenticación

      const client = await clientPromise; // Conectar a MongoDB
      const db = client.db(process.env.MONGODB_DB); // Seleccionar la base de datos
      const usersCollection = db.collection("Clientes"); // Seleccionar la colección de usuarios

      const userData = {
        name: user.name, // Nombre del usuario
        email: user.email, // Email del usuario
        image: user.image || null, // Imagen del usuario (si tiene)
      };

      const existingUser = await usersCollection.findOne({ email: user.email }); // Buscar si el usuario ya existe en la base de datos

      if (!existingUser) {
        await usersCollection.insertOne(userData); // Si el usuario no existe, se guarda en la base de datos
      }

      return true; // Permitir el inicio de sesión
    },
    // Callback que se ejecuta cuando se crea una sesión
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? ""; // Asigna el ID del usuario a la sesión
        session.user.email = token.email; // Asigna el email del usuario a la sesión
      }
      return session; // Retorna la sesión con los datos actualizados
    },
    // Callback para manipular el token JWT
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email; // Guarda el email en el token
      }
      return token; // Retorna el token con la información actualizada
    },
  },
  pages: {
    signIn: "/register", // Página personalizada para iniciar sesión
  },
});

export { handler as GET, handler as POST }; // Exporta el handler para manejar peticiones GET y POST
