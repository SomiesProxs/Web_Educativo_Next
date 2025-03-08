import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ message: "Todos los campos son obligatorios" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const ClientesCollection = db.collection("Clientes");

    // Buscar usuario en la base de datos
    const user = await ClientesCollection.findOne({ username });

    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 401 });
    }

    // Comparar contraseña encriptada
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Contraseña incorrecta" }, { status: 401 });
    }

    return NextResponse.json({ message: "Login exitoso", success: true }, { status: 200 });

  } catch (error) {
    console.error("Error en el servidor:", (error as Error).message);
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 });
  }
}
