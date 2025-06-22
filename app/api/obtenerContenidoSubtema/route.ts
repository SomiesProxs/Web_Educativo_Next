import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { NextRequest } from "next/server";

// Type definitions
interface Subtema {
  nombre: string;
  contenido?: string;
  imagenes?: string[];
  estado?: number;
}

interface Titulo {
  titulo: string;
  estado: number;
  subtemas: Subtema[];
}

interface CursoData {
  nivel: string;
  curso: string;
  titulos: Titulo[];
}

interface RequestBody {
  nivel: string;
  curso: string;
  titulo: string;
  subtema: string;
}

export async function POST(req: NextRequest) {
  try {
    const { nivel, curso, titulo, subtema }: RequestBody = await req.json();

    // Validación básica
    if (!nivel || !curso || !titulo || !subtema) {
      return NextResponse.json(
        { message: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection<CursoData>("Cursos");

    const cursoData = await collection.findOne({ nivel, curso });

    if (!cursoData || !Array.isArray(cursoData.titulos)) {
      return NextResponse.json(
        { message: "Curso no encontrado" },
        { status: 404 }
      );
    }

    const tituloData = cursoData.titulos.find(
      (item: Titulo) => item.titulo === titulo
    );

    if (!tituloData) {
      return NextResponse.json(
        { message: "Título no encontrado en este curso" },
        { status: 404 }
      );
    }

    const subtemaData = tituloData.subtemas.find(
      (item: Subtema) => item.nombre === subtema
    );

    if (!subtemaData) {
      return NextResponse.json(
        { message: "Subtema no encontrado en este título" },
        { status: 404 }
      );
    }

    // ✅ ACCESO PÚBLICO - Todo el mundo puede leer el contenido
    return NextResponse.json({
      contenido: subtemaData.contenido || "<p>Sin contenido disponible</p>",
    });
  } catch (error) {
    console.error("Error al obtener contenido del subtema:", error);
    return NextResponse.json(
      { message: "Error en el servidor" },
      { status: 500 }
    );
  }
}