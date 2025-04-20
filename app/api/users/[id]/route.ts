import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Función para obtener la colección de usuarios
const getCollection = async () => {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  return db.collection("Clientes");
};

// Manejador unificado para múltiples métodos HTTP
export async function handler(request: NextRequest) {
  const method = request.method;
  
  // Obtener el id del URL
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const id = pathParts[pathParts.length - 1];
  
  try {
    const collection = await getCollection();
    
    // Manejar PATCH
    if (method === 'PATCH') {
      const updates = await request.json();
      
      if (!updates.username || !updates.email) {
        return NextResponse.json({ message: "Nombre y correo son obligatorios" }, { status: 400 });
      }
      
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updates }
      );
      
      if (result.modifiedCount === 1) {
        return NextResponse.json({ message: "Usuario actualizado correctamente" }, { status: 200 });
      } else {
        return NextResponse.json({ message: "No se realizaron cambios o usuario no encontrado" }, { status: 404 });
      }
    }
    
    // Manejar DELETE
    if (method === 'DELETE') {
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      
      if (result.deletedCount === 1) {
        return NextResponse.json({ message: "Usuario eliminado correctamente" }, { status: 200 });
      } else {
        return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
      }
    }
    
    // Método no soportado
    return NextResponse.json({ message: "Método no permitido" }, { status: 405 });
  } catch (error) {
    console.error(`Error al procesar solicitud ${method}:`, error);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}

// Exportar aliases para los métodos HTTP específicos
export const PATCH = handler;
export const DELETE = handler;