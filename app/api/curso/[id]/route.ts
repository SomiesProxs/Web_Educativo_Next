import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Await params antes de usar sus propiedades
    const resolvedParams = await params;
    const cursoId = resolvedParams.id;
    
    if (!cursoId) {
      return NextResponse.json({ error: "ID del curso requerido" }, { status: 400 });
    }

    // Validar que el ID sea un ObjectId válido
    if (!ObjectId.isValid(cursoId)) {
      return NextResponse.json({ error: "ID del curso inválido" }, { status: 400 });
    }

    // Obtener curso
    const curso = await db
      .collection("Cursos")
      .findOne({ _id: new ObjectId(cursoId) });

    if (!curso) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
    }

    // Obtener títulos/modulos asociados al curso
    const titulos = await db
      .collection("Modulos") // o 'Titulos' según tu base de datos
      .find({ cursoId })
      .sort({ orden: 1 }) // opcional
      .toArray();

    // Armar estructura con subtemas agrupados por título
    const cursoCompleto = {
      ...curso,
      titulos: titulos.map((mod) => ({
        titulo: mod.titulo,
        subtemas: mod.subtemas || []
      }))
    };

    return NextResponse.json({ curso: cursoCompleto });
  } catch (error) {
    console.error("❌ Error en /api/curso/[id]:", error);
    return NextResponse.json({ error: "Error en la consulta" }, { status: 500 });
  }
}