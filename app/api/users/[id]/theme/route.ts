import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(req: NextRequest) {
  const urlParts = req.url.split("/");
  const id = urlParts[urlParts.length - 2]; // Agarrar el ID de la URL

  const { theme } = await req.json();

  if (![0, 1].includes(theme)) {
    return NextResponse.json({ error: "Valor de theme inválido" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection("Clientes");

    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { theme } }
    );

    return NextResponse.json({ message: "Theme actualizado", theme });
  } catch (error) {
    console.error("Error al actualizar el tema:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}