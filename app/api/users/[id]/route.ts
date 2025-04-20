import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Actualizar usuario (PATCH)
export async function PATCH(
  req: Request,
  context: { params: { [key: string]: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection("Clientes");

    const updates = await req.json();

    if (!updates.username || !updates.email) {
      return NextResponse.json(
        { message: "Nombre y correo son obligatorios" },
        { status: 400 }
      );
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(context.params.id) },
      { $set: updates }
    );

    if (result.modifiedCount === 1) {
      return NextResponse.json(
        { message: "Usuario actualizado correctamente" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "No se realizaron cambios o usuario no encontrado" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}

// Eliminar usuario (DELETE)
export async function DELETE(
  req: Request,
  context: { params: { [key: string]: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection("Clientes");

    const id = context.params.id;

    const result = await collection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 1) {
      return NextResponse.json(
        { message: "Usuario eliminado correctamente" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}
