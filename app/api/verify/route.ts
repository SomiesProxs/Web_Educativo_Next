// app/api/verify/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    // Verificación de datos de entrada
    if (!email || !code) {
      return NextResponse.json({ message: "Datos incompletos" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const ClientesCollection = db.collection("Clientes");

    // Buscar al usuario en la base de datos
    const user = await ClientesCollection.findOne({ email });

    // Comprobar si el usuario existe y si el código es válido
    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    if (!user.verificationCode || user.verificationCode !== code || Date.now() > user.codeExpires) {
      return NextResponse.json({ message: "Código inválido o expirado" }, { status: 401 });
    }

    // Eliminar el código de verificación tras la validación exitosa
    await ClientesCollection.updateOne(
      { email },
      { $unset: { verificationCode: "", codeExpires: "" } }
    );

    // Retornar la respuesta con el ID del usuario y su nombre
    return NextResponse.json({
      success: true,
      userId: user._id.toString(),
      username: user.username || user.name || "Usuario",
    }, { status: 200 });

  } catch (error) {
    console.error("Error en el servidor:", error);
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 });
  }
}
