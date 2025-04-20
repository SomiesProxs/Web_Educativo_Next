import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

// PATCH: Actualizar usuario
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = new MongoClient(process.env.MONGODB_URI as string);
    await client.connect();
    
    const db = client.db("SomiesProxs");
    const collection = db.collection("Clientes");
    
    const updates = await request.json();
    
    if (!updates.username || !updates.email) {
      await client.close();
      return NextResponse.json({ message: "Nombre y correo son obligatorios" }, { status: 400 });
    }
    
    const result = await collection.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updates }
    );
    
    await client.close();
    
    if (result.modifiedCount === 1) {
      return NextResponse.json({ message: "Usuario actualizado correctamente" });
    } else {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}

// DELETE: Eliminar usuario
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = new MongoClient(process.env.MONGODB_URI as string);
    await client.connect();
    
    const db = client.db("SomiesProxs");
    const collection = db.collection("Clientes");
    
    const result = await collection.deleteOne({ _id: new ObjectId(params.id) });
    
    await client.close();
    
    if (result.deletedCount === 1) {
      return NextResponse.json({ message: "Usuario eliminado correctamente" });
    } else {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}