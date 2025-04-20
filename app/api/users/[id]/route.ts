import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Función para obtener la colección de usuarios
const getCollection = async () => {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  return db.collection("Clientes");
};

// PATCH: Actualizar usuario
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const collection = await getCollection();
    
    const updates = await request.json();
    
    if (!updates.username || !updates.email) {
      return NextResponse.json({ message: "Nombre y correo son obligatorios" }, { status: 400 });
    }
    
    const result = await collection.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updates }
    );
    
    if (result.modifiedCount === 1) {
      return NextResponse.json({ message: "Usuario actualizado correctamente" }, { status: 200 });
    } else {
      return NextResponse.json({ message: "No se realizaron cambios o usuario no encontrado" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}

// DELETE: Eliminar usuario - con tipo NextRequest
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const collection = await getCollection();
    
    const result = await collection.deleteOne({ _id: new ObjectId(params.id) });
    
    if (result.deletedCount === 1) {
      return NextResponse.json({ message: "Usuario eliminado correctamente" }, { status: 200 });
    } else {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}