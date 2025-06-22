import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

// Type definitions
interface Subtema {
  _id?: string | ObjectId;
  nombre: string;
  contenido?: string;
  imagenes?: string[];
  estado?: number;
}

interface Titulo {
  titulo: string;
  estado: number;
  subtemas?: Subtema[];
}

interface Curso {
  _id: ObjectId;
  nivel: string;
  curso: string;
  titulos?: Titulo[];
  creadoEn?: Date;
}

interface QueryFilter {
  nivel?: string;
  curso?: string;
}

interface ResultItem {
  _id: string;
  nivel: string;
  curso: string;
  titulo: string;
  estado: number;
  subtemas: Array<{
    nombre: string;
    contenido: string;
    imagenes: string[];
    _id: string;
    estado?: number;
  }>;
  creadoEn: string;
  error?: string;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const nivel = url.searchParams.get('nivel');
  const curso = url.searchParams.get('curso');
  const titulo = url.searchParams.get('titulo');
  
  let client: MongoClient | null = null;
  
  try {
    // Conexión a la base de datos
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('MONGODB_URI no está definido');
      return NextResponse.json({ message: 'Error de configuración del servidor' }, { status: 500 });
    }
    
    client = new MongoClient(uri);
    await client.connect();
    console.log('Conectado a MongoDB');
    
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection<Curso>('Cursos');
    
    // Construir la consulta dependiendo de los parámetros
    const query: QueryFilter = {};
    
    if (nivel) query.nivel = nivel;
    if (curso) query.curso = curso;
    
    console.log('Ejecutando consulta con parámetros:', query);
    
    // Obtener los cursos, filtrando por los parámetros
    const cursos = await collection.find(query).toArray();
    console.log(`Se encontraron ${cursos.length} documentos`);
    
    if (cursos.length === 0) {
      // Si no hay nivel seleccionado, intentar devolver todos los niveles disponibles
      if (!nivel) {
        const todosLosNiveles = await collection.distinct('nivel');
        if (todosLosNiveles.length > 0) {
          const resultadosNiveles: ResultItem[] = todosLosNiveles.map(nivelItem => ({
            _id: `nivel-${nivelItem}`,
            nivel: nivelItem,
            curso: '',
            titulo: 'Sin títulos disponibles',
            estado: 0,
            subtemas: [],
            creadoEn: new Date().toISOString()
          }));
          return NextResponse.json(resultadosNiveles, { status: 200 });
        }
      }
      
      // SIEMPRE devolver un array, aunque esté vacío
      console.log('No se encontraron cursos, devolviendo array vacío');
      return NextResponse.json([], { status: 200 });
    }
    
    // Procesar los resultados según los parámetros solicitados
    let result: ResultItem[] = [];
    
    if (titulo) {
      // Si se solicita un título específico, filtrar y devolver solo ese título
      cursos.forEach((curso) => {
        const tituloEncontrado = curso.titulos?.find((t: Titulo) => t.titulo === titulo);
        
        if (tituloEncontrado) {
          result.push({
            _id: curso._id.toString(),
            nivel: curso.nivel,
            curso: curso.curso,
            titulo: tituloEncontrado.titulo,
            estado: tituloEncontrado.estado,
            subtemas: tituloEncontrado.subtemas ? tituloEncontrado.subtemas.map((subtema: Subtema, index: number) => ({
              nombre: subtema.nombre,
              contenido: subtema.contenido || '',
              imagenes: Array.isArray(subtema.imagenes) ? subtema.imagenes : [],
              _id: subtema._id?.toString() || `subtema-${index}`
            })) : [],
            creadoEn: curso.creadoEn ? curso.creadoEn.toISOString() : new Date().toISOString(),
          });
        }
      });
    } else {
      // MOSTRAR TODOS LOS TÍTULOS, sin filtrar por estado
      cursos.forEach((curso) => {
        if (curso.titulos && curso.titulos.length > 0) {
          curso.titulos.forEach((tituloItem: Titulo) => {
            // ELIMINAR el filtro de estado - mostrar todos los títulos
            result.push({
              _id: curso._id.toString(),
              nivel: curso.nivel,
              curso: curso.curso,
              titulo: tituloItem.titulo,
              estado: tituloItem.estado, // Mantener el estado original (0 o 1)
              subtemas: tituloItem.subtemas ? tituloItem.subtemas.map((subtema: Subtema, index: number) => ({
                nombre: subtema.nombre,
                contenido: subtema.contenido || '',
                imagenes: Array.isArray(subtema.imagenes) ? subtema.imagenes : [],
                _id: subtema._id?.toString() || `subtema-${index}`,
                estado: subtema.estado // Mantener estado del subtema también
              })) : [],
              creadoEn: curso.creadoEn ? curso.creadoEn.toISOString() : new Date().toISOString(),
            });
          });
        } else {
          // Si no hay títulos en el curso, crear uno por defecto
          result.push({
            _id: curso._id.toString(),
            nivel: curso.nivel,
            curso: curso.curso,
            titulo: 'Sin títulos configurados',
            estado: 0,
            subtemas: [],
            creadoEn: curso.creadoEn ? curso.creadoEn.toISOString() : new Date().toISOString(),
          });
        }
      });
    }
    
    // SIEMPRE devolver un array
    if (result.length === 0) {
      console.log('No se encontraron títulos, devolviendo array con mensaje');
      result = [{
        _id: 'no-data',
        nivel: nivel || 'Sin nivel',
        curso: curso || 'Sin curso',
        titulo: 'No hay contenido disponible',
        estado: 0,
        subtemas: [],
        creadoEn: new Date().toISOString()
      }];
    }
    
    console.log(`Devolviendo ${result.length} resultados`);
    console.log('Resultado final:', JSON.stringify(result, null, 2));
    
    return NextResponse.json(result, { status: 200 });
    
  } catch (error) {
    console.error('Error al obtener cursos:', error);
    // SIEMPRE devolver un array, incluso en caso de error
    return NextResponse.json([{
      _id: 'error',
      nivel: nivel || 'Error',
      curso: curso || 'Error',
      titulo: 'Error al cargar contenido',
      estado: 0,
      subtemas: [],
      creadoEn: new Date().toISOString(),
      error: (error as Error).message
    }], { status: 200 }); // Cambiar a 200 para que el frontend pueda procesar
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