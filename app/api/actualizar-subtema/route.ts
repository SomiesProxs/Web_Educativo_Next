// app/api/actualizar-subtema/route.ts
import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

export async function POST(req: Request) {
  let client: MongoClient | null = null;
  
  try {
    // Obtener los datos de la solicitud
    const { cursoId, titulo, subtemaIndex, nuevoContenido } = await req.json();
    
    // Validar los datos
    if (!cursoId || !titulo || subtemaIndex === undefined || nuevoContenido === undefined) {
      return NextResponse.json(
        { success: false, message: 'Faltan datos requeridos (cursoId, titulo, subtemaIndex, nuevoContenido)' }, 
        { status: 400 }
      );
    }
    
    // Conectar a la base de datos
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('MONGODB_URI no está definido');
      return NextResponse.json(
        { success: false, message: 'Error de configuración del servidor' }, 
        { status: 500 }
      );
    }
    
    client = new MongoClient(uri);
    await client.connect();
    console.log('Conectado a MongoDB');
    
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection('Cursos');
    
    // Buscar el curso y encontrar el índice del título
    const curso = await collection.findOne({ _id: new ObjectId(cursoId) });
    
    if (!curso) {
      return NextResponse.json(
        { success: false, message: 'No se encontró el curso' }, 
        { status: 404 }
      );
    }
    
    // Encontrar el índice del título en el array de títulos
    const tituloIndex = curso.titulos?.findIndex((t: any) => t.titulo === titulo);
    
    if (tituloIndex === undefined || tituloIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'No se encontró el título especificado' }, 
        { status: 404 }
      );
    }
    
    // Validar que el subtema existe
    if (!curso.titulos[tituloIndex].subtemas || 
        !curso.titulos[tituloIndex].subtemas[subtemaIndex]) {
      return NextResponse.json(
        { success: false, message: 'No se encontró el subtema especificado' }, 
        { status: 404 }
      );
    }
    
    // Crear la consulta de actualización usando el path completo
    const updateField = `titulos.${tituloIndex}.subtemas.${subtemaIndex}.contenido`;
    const updateQuery = {
      $set: { [updateField]: nuevoContenido }
    };
    
    console.log('Actualizando campo:', updateField);
    console.log('Con contenido:', nuevoContenido);
    
    // Actualizar el documento
    const result = await collection.updateOne(
      { _id: new ObjectId(cursoId) },
      updateQuery
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'No se pudo actualizar el documento' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Contenido del subtema actualizado correctamente',
      result: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        titulo: titulo,
        subtemaIndex: subtemaIndex
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error al actualizar subtema:', error);
    return NextResponse.json(
      { success: false, message: 'Error en el servidor', error: (error as Error).message }, 
      { status: 500 }
    );
  } finally {
    if (client) {
      try {
        await client.close();
        console.log('Conexión a MongoDB cerrada');
      } catch (err) {
        console.error('Error al cerrar la conexión:', err);
      }
    }
  }
}