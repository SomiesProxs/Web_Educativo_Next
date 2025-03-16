// app/api/verify/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ message: "Datos incompletos" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const ClientesCollection = db.collection("Clientes");

    const user = await ClientesCollection.findOne({ email });

    if (!user || user.verificationCode !== code || Date.now() > user.codeExpires) {
      return NextResponse.json({ message: "Código inválido o expirado" }, { status: 401 });
    }

    // Eliminar código de verificación tras la confirmación
    await ClientesCollection.updateOne({ email }, { $unset: { verificationCode: "", codeExpires: "" } });

    // Devolver éxito con el ID del usuario para iniciar sesión
    return NextResponse.json({ 
      success: true, 
      userId: user._id.toString(),
      username: user.username || user.name || "Usuario"
    }, { status: 200 });
  } catch (error) {
    console.error("Error en el servidor:", error);
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 });
  }
}