import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  let client: MongoClient | null = null;

  try {
    client = new MongoClient(process.env.MONGODB_URI as string);
    await client.connect();
    const db = client.db(process.env.MONGODB_DB);
    const ClientesCollection = db.collection("Clientes");

    const { username, email, password, dni, phone } = await req.json();

    // Verifica que todos los campos obligatorios estén presentes
    if (!username || !email || !password || !dni || !phone) {
      return NextResponse.json({ message: "Todos los campos son obligatorios" }, { status: 400 });
    }

    // Convierte el email a minúsculas
    const emailLowerCase = email.toLowerCase();

    // Verifica si el usuario ya existe
    const existingUser = await ClientesCollection.findOne({ email: emailLowerCase });

    if (existingUser) {
      return NextResponse.json({ message: "El correo ya está en uso" }, { status: 400 });
    }

    // Crea el nuevo usuario con los campos adicionales
    const newUser = {
        username,
        email: emailLowerCase,
        dni,
        phone,
        birthDate: "", // Inicialmente vacío
        gender: "", // Inicialmente vacío
        stars: 20, // Asignamos 20 estrellas por defecto
        createdAt: new Date(),
    };

    // Inserta el nuevo usuario en la base de datos
    await ClientesCollection.insertOne(newUser);

    return NextResponse.json({ message: "Usuario registrado exitosamente" }, { status: 201 });
  } catch (error) {
    console.error("Error en el registro:", error);
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
}
