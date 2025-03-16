// app/api/check-user/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "El correo es requerido" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const ClientesCollection = db.collection("Clientes");

    // Buscar el usuario por correo electrónico (normalizado a minúsculas)
    const user = await ClientesCollection.findOne({ email: email.toLowerCase() });

    // Responder si existe o no
    return NextResponse.json({ 
      exists: !!user,
      message: user ? "Usuario encontrado" : "Usuario no encontrado" 
    }, { status: 200 });
  } catch (error) {
    console.error("Error al verificar usuario:", error);
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 });
  }
}