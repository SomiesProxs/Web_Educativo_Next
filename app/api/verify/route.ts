// Función para verificar el código de confirmación de registro
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({}, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const ClientesCollection = db.collection("Clientes");

    const user = await ClientesCollection.findOne({ email });

    if (!user || user.verificationCode !== code || Date.now() > user.codeExpires) {
      return NextResponse.json({}, { status: 401 });
    }

    // Eliminar código de verificación tras la confirmación
    await ClientesCollection.updateOne({ email }, { $unset: { verificationCode: "", codeExpires: "" } });

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error("Error en el servidor:", error);
    return NextResponse.json({}, { status: 500 });
  }
}
