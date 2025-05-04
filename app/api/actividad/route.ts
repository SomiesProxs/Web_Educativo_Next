import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const { nivel, curso, titulo } = await req.json();

    if (!nivel || !curso || !titulo) {
      return NextResponse.json({ message: "Faltan datos" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const Actividades = db.collection("Actividades");

    // Ruta para la carpeta del curso
    const nivelPath = path.join(process.cwd(), 'app', 'CURSOS', nivel.toUpperCase(), curso);

    // Verifica si la carpeta del curso existe. Si no, la crea.
    let cursoCreado = false;
    if (!fs.existsSync(nivelPath)) {
      fs.mkdirSync(nivelPath, { recursive: true });
      console.log(`Carpeta creada para el curso ${curso} en el nivel ${nivel.toUpperCase()}`);
      cursoCreado = true; // Indicamos que se creó el curso

      // Crear el archivo page.tsx en la carpeta del curso
      const pageContent = `// Este archivo representa la página de la actividad del curso ${curso}\n\nexport default function Page() {\n  return <h1>${titulo}</h1>\n}`;
      const pagePath = path.join(nivelPath, 'page.tsx');

      // Crear el archivo page.tsx
      fs.writeFileSync(pagePath, pageContent);
      console.log(`Archivo 'page.tsx' creado en ${nivelPath}`);
    } else {
      console.log(`La carpeta para el curso ${curso} en el nivel ${nivel.toUpperCase()} ya existe.`);
    }

    // Verificar si ya existe una actividad con el mismo título y curso
    const existingActivity = await Actividades.findOne({ curso, titulo });

    if (existingActivity) {
      // Si la actividad ya existe, retornamos que solo se creó la actividad
      return NextResponse.json({ message: "Actividad creada" }, { status: 200 });
    }

    // Crear la nueva actividad
    const nuevaActividad = {
      nivel,
      curso,
      titulo,
      estrellasRequeridas: 5,
      vistaGenerada: false,
      createdAt: new Date(),
    };

    const result = await Actividades.insertOne(nuevaActividad);

    // Si el curso es nuevo y la actividad se creó, respondemos con el mensaje adecuado
    const mensaje = cursoCreado ? "Curso y actividad creados" : "Actividad creada";

    return NextResponse.json({ message: mensaje, id: result.insertedId }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error al crear actividad:", error.message);
      return NextResponse.json({ message: "Error de servidor", error: error.message }, { status: 500 });
    } else {
      console.error("Error desconocido:", error);
      return NextResponse.json({ message: "Error desconocido", error: "Un error desconocido ocurrió" }, { status: 500 });
    }
  }
}
