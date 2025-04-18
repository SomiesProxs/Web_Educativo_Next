// Importa el cliente de MongoDB para conectarse a la base de datos
import { MongoClient } from "mongodb";

// Define la función GET que maneja solicitudes HTTP GET
export async function GET(req) {
  try {
    // Obtiene la URL de la solicitud y extrae el parámetro "email"
    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    // Verifica si el email está presente, si no, responde con un error 400
    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), { status: 400 });
    }

    // Crea un cliente de MongoDB y se conecta a la base de datos
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();

    // Selecciona la base de datos "SomiesProxs" y la colección "Clientes"
    const db = client.db("SomiesProxs");
    const users = db.collection("Clientes");

    // Busca un usuario en la colección que coincida con el email
    const user = await users.findOne({ email });

    // Cierra la conexión con la base de datos
    await client.close();

    // Verifica si el usuario no existe y responde con un error 404
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    // Devuelve la imagen del usuario si existe, o una cadena vacía si no tiene imagen
    return new Response(JSON.stringify({ image: user.image || "" }), { status: 200 });

  } catch (error) {
    // Captura errores, los muestra en la consola y responde con un error 500
    console.error("Error fetching user:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
