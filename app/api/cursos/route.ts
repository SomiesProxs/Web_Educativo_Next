import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

function limpiarNombreArchivo(nombre: string): string {
  return nombre
    .replace(/[¿?¡!:*<>|"]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^\w\-_áéíóúüñÁÉÍÓÚÜÑ]/g, '')
    .substring(0, 50)
    .replace(/^_+|_+$/g, '') || 'sin_nombre';
}

export async function POST(req: Request) {
  let client: MongoClient | null = null;

  try {
    const { nivel, curso, titulos } = await req.json();

    if (!nivel || !curso || !Array.isArray(titulos) || titulos.length === 0) {
      return NextResponse.json(
        { message: 'Faltan datos requeridos o lista de títulos vacía' },
        { status: 400 }
      );
    }

    const titulosFormateados = titulos.map((tituloObj: any) => {
      const { titulo, estado, subtemas } = tituloObj;

      if (!titulo || typeof estado !== 'number' || !Array.isArray(subtemas)) {
        throw new Error('Formato inválido en alguno de los títulos');
      }

      return {
        titulo,
        tituloLimpio: limpiarNombreArchivo(titulo),
        estado,
        subtemas: subtemas.map((nombre: string) => ({
          nombre,
          nombreLimpio: limpiarNombreArchivo(nombre),
          contenido: "",
          imagenes: [], // <-- Añadido aquí el campo imagenes vacío
        })),
      };
    });

    const nuevoCurso = {
      nivel,
      curso,
      titulos: titulosFormateados,
      creadoEn: new Date(),
    };

    client = new MongoClient(process.env.MONGODB_URI as string);
    await client.connect();
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection('Cursos');

    await collection.insertOne(nuevoCurso);

    return NextResponse.json({ 
      message: 'Curso creado exitosamente' 
    }, { status: 201 });

  } catch (error) {
    console.error('Error al crear curso:', error);
    return NextResponse.json({ 
      message: 'Error en el servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  } finally {
    if (client) await client.close();
  }
}
