// app/api/imagen/route.ts

import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { v2 as cloudinary } from "cloudinary";
import { Db } from "mongodb";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Define interfaces for your data structures
interface ImagenBase64 {
  base64: string;
  name: string;
}

interface ImagenGuardada {
  id: number;
  name: string;
  originalName: string;
  url: string;
  publicId: string;
  uploadedAt: string;
}

interface Subtema {
  nombre: string;
  nombreLimpio: string;
  contenido: string;
  imagenes: ImagenGuardada[];
}

interface Titulo {
  titulo: string;
  tituloLimpio: string;
  estado: number;
  subtemas: Subtema[];
}

interface CursoDocument {
  _id?: string;
  nivel: string;
  curso: string;
  titulos: Titulo[];
  creadoEn: Date;
}

interface PostRequestBody {
  nivel: string;
  curso: string;
  titulo: string;
  subtema: string;
  nuevasImagenesBase64: ImagenBase64[];
}

interface DeleteRequestBody {
  nivel: string;
  curso: string;
  titulo: string;
  subtema: string;
  indexImagen: number;
}

interface PutRequestBody {
  nivel: string;
  curso: string;
  titulo: string;
  subtema: string;
  indexImagen: number;
  nuevaImagen: ImagenBase64;
}

// Función para extraer public_id de una URL de Cloudinary
function extractPublicId(url: string): string | null {
  try {
    const urlParts = url.split('/');
    const fileWithExtension = urlParts[urlParts.length - 1];
    const publicId = fileWithExtension.split('.')[0];
    return publicId;
  } catch (error) {
    console.error('Error extrayendo public_id:', error);
    return null;
  }
}

// Función para eliminar imagen de Cloudinary
async function deleteFromCloudinary(url: string): Promise<void> {
  try {
    const publicId = extractPublicId(url);
    if (publicId) {
      await cloudinary.uploader.destroy(`CursosImagen/${publicId}`);
    }
  } catch (error) {
    console.error('Error eliminando de Cloudinary:', error);
  }
}

// Función para validar formato de imagen base64
function isValidImageBase64(base64: string): boolean {
  return base64.startsWith('data:image/') && base64.includes('base64,');
}

// Función para generar nombre único
function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const extension = originalName.split('.').pop() || 'jpg';
  const nameWithoutExt = originalName.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_');
  return `${nameWithoutExt}_${timestamp}_${random}.${extension}`;
}

async function updateImagenes(
  db: Db,
  nivel: string,
  curso: string,
  titulo: string,
  subtemaNombre: string,
  imagenes: ImagenGuardada[]
) {
  const collection = db.collection<CursoDocument>("Cursos");

  // Filtro corregido según la estructura real
  const filter = {
    nivel,
    curso,
  };

  const update = {
    $set: {
      "titulos.$[tituloElem].subtemas.$[subtemaElem].imagenes": imagenes,
    },
  };

  const options = {
    arrayFilters: [
      { "tituloElem.titulo": titulo },
      { "subtemaElem.nombre": subtemaNombre },
    ],
  };

  const result = await collection.findOneAndUpdate(filter, update, options);
  return result;
}

// POST: Subir imágenes nuevas
export async function POST(req: Request) {
  try {
    const { nivel, curso, titulo, subtema, nuevasImagenesBase64 }: PostRequestBody = await req.json();

    // Validaciones
    if (
      !nivel ||
      !curso ||
      !titulo ||
      !subtema ||
      !Array.isArray(nuevasImagenesBase64) ||
      nuevasImagenesBase64.length === 0
    ) {
      return NextResponse.json(
        { message: "Faltan parámetros o formato incorrecto" },
        { status: 400 }
      );
    }

    // Validar que todas las imágenes tengan formato correcto
    for (const img of nuevasImagenesBase64) {
      if (!img.base64 || !img.name || !isValidImageBase64(img.base64)) {
        return NextResponse.json(
          { message: "Una o más imágenes tienen formato inválido" },
          { status: 400 }
        );
      }
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection<CursoDocument>("Cursos");

    // Buscar el documento correcto según la estructura real
    const cursoDoc = await collection.findOne({
      nivel,
      curso,
    });

    if (!cursoDoc) {
      return NextResponse.json({ message: "Curso no encontrado" }, { status: 404 });
    }

    // Buscar el título y subtema en la estructura correcta
    const tituloObj = cursoDoc.titulos?.find((t: Titulo) => t.titulo === titulo);
    if (!tituloObj) {
      return NextResponse.json({ message: "Título no encontrado" }, { status: 404 });
    }

    const subtemaObj = tituloObj.subtemas?.find((s: Subtema) => s.nombre === subtema);
    if (!subtemaObj) {
      return NextResponse.json({ message: "Subtema no encontrado" }, { status: 404 });
    }

    const imagenesActuales = Array.isArray(subtemaObj.imagenes)
      ? subtemaObj.imagenes
      : [];

    // Subir imágenes a Cloudinary con transformaciones
    const nuevasImagenes = await Promise.all(
      nuevasImagenesBase64.map(async (img: ImagenBase64) => {
        const uniqueFileName = generateUniqueFileName(img.name);
        const publicId = uniqueFileName.split('.')[0];

        const uploadResult = await cloudinary.uploader.upload(img.base64, {
          folder: "CursosImagen",
          public_id: publicId,
          overwrite: false,
          transformation: [
            { width: 1200, height: 1200, crop: "limit" },
            { quality: "auto" },
            { fetch_format: "auto" }
          ]
        });

        return {
          id: Date.now() + Math.random(), // ID único para el frontend
          name: img.name,
          originalName: img.name,
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          uploadedAt: new Date().toISOString()
        };
      })
    );

    const imagenesActualizadas = imagenesActuales.concat(nuevasImagenes);

    const actualizado = await updateImagenes(db, nivel, curso, titulo, subtema, imagenesActualizadas);

    if (!actualizado) {
      // Si falla la actualización, limpiar las imágenes subidas
      await Promise.all(
        nuevasImagenes.map(img => deleteFromCloudinary(img.url))
      );
      
      return NextResponse.json(
        { message: "No se pudo actualizar el documento" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: "Imágenes agregadas exitosamente", 
        data: actualizado,
        imagenesAgregadas: nuevasImagenes.length
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en POST /api/imagen:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}

// DELETE: Eliminar una imagen por índice
export async function DELETE(req: Request) {
  try {
    const { nivel, curso, titulo, subtema, indexImagen }: DeleteRequestBody = await req.json();

    if (
      !nivel || !curso || !titulo || !subtema || 
      typeof indexImagen !== "number" || indexImagen < 0
    ) {
      return NextResponse.json(
        { message: "Faltan parámetros o formato incorrecto" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection<CursoDocument>("Cursos");

    // Buscar el documento correcto
    const cursoDoc = await collection.findOne({
      nivel,
      curso,
    });

    if (!cursoDoc) {
      return NextResponse.json({ message: "Curso no encontrado" }, { status: 404 });
    }

    const tituloObj = cursoDoc.titulos?.find((t: Titulo) => t.titulo === titulo);
    if (!tituloObj) {
      return NextResponse.json({ message: "Título no encontrado" }, { status: 404 });
    }

    const subtemaObj = tituloObj.subtemas?.find((s: Subtema) => s.nombre === subtema);
    if (!subtemaObj) {
      return NextResponse.json({ message: "Subtema no encontrado" }, { status: 404 });
    }

    const imagenesActuales = Array.isArray(subtemaObj.imagenes)
      ? subtemaObj.imagenes
      : [];

    if (indexImagen >= imagenesActuales.length) {
      return NextResponse.json({ message: "Índice de imagen inválido" }, { status: 400 });
    }

    // Obtener la imagen a eliminar
    const imagenAEliminar = imagenesActuales[indexImagen];
    
    // Eliminar de Cloudinary
    if (imagenAEliminar?.url) {
      await deleteFromCloudinary(imagenAEliminar.url);
    }

    // Eliminar del array
    imagenesActuales.splice(indexImagen, 1);

    const actualizado = await updateImagenes(db, nivel, curso, titulo, subtema, imagenesActuales);

    if (!actualizado) {
      return NextResponse.json(
        { message: "No se pudo actualizar el documento" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: "Imagen eliminada exitosamente", 
        data: actualizado,
        imagenEliminada: imagenAEliminar?.name || `Imagen ${indexImagen + 1}`
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en DELETE /api/imagen:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}

// PUT: Reemplazar imagen en un índice específico
export async function PUT(req: Request) {
  try {
    const { nivel, curso, titulo, subtema, indexImagen, nuevaImagen }: PutRequestBody = await req.json();

    if (
      !nivel || !curso || !titulo || !subtema ||
      typeof indexImagen !== "number" || indexImagen < 0 ||
      !nuevaImagen || !nuevaImagen.base64 || !nuevaImagen.name
    ) {
      return NextResponse.json(
        { message: "Faltan parámetros o formato incorrecto" },
        { status: 400 }
      );
    }

    // Validar formato de imagen
    if (!isValidImageBase64(nuevaImagen.base64)) {
      return NextResponse.json(
        { message: "Formato de imagen inválido" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection<CursoDocument>("Cursos");

    // Buscar el documento correcto
    const cursoDoc = await collection.findOne({
      nivel,
      curso,
    });

    if (!cursoDoc) {
      return NextResponse.json({ message: "Curso no encontrado" }, { status: 404 });
    }

    const tituloObj = cursoDoc.titulos?.find((t: Titulo) => t.titulo === titulo);
    if (!tituloObj) {
      return NextResponse.json({ message: "Título no encontrado" }, { status: 404 });
    }

    const subtemaObj = tituloObj.subtemas?.find((s: Subtema) => s.nombre === subtema);
    if (!subtemaObj) {
      return NextResponse.json({ message: "Subtema no encontrado" }, { status: 404 });
    }

    const imagenesActuales = Array.isArray(subtemaObj.imagenes)
      ? subtemaObj.imagenes
      : [];

    if (indexImagen >= imagenesActuales.length) {
      return NextResponse.json({ message: "Índice de imagen inválido" }, { status: 400 });
    }

    // Obtener la imagen actual para eliminarla después
    const imagenAnterior = imagenesActuales[indexImagen];

    // Subir nueva imagen a Cloudinary
    const uniqueFileName = generateUniqueFileName(nuevaImagen.name);
    const publicId = uniqueFileName.split('.')[0];

    const uploadResult = await cloudinary.uploader.upload(nuevaImagen.base64, {
      folder: "CursosImagen",
      public_id: publicId,
      overwrite: false,
      transformation: [
        { width: 1200, height: 1200, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" }
      ]
    });

    const imagenActualizada = {
      id: Date.now() + Math.random(),
      name: nuevaImagen.name,
      originalName: nuevaImagen.name,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      uploadedAt: new Date().toISOString()
    };

    // Actualizar en el array
    imagenesActuales[indexImagen] = imagenActualizada;

    const actualizado = await updateImagenes(db, nivel, curso, titulo, subtema, imagenesActuales);

    if (!actualizado) {
      // Si falla, eliminar la nueva imagen subida
      await deleteFromCloudinary(uploadResult.secure_url);
      return NextResponse.json(
        { message: "No se pudo actualizar el documento" },
        { status: 500 }
      );
    }

    // Eliminar la imagen anterior de Cloudinary
    if (imagenAnterior?.url) {
      await deleteFromCloudinary(imagenAnterior.url);
    }

    return NextResponse.json(
      { 
        message: "Imagen actualizada exitosamente", 
        data: actualizado,
        imagenAnterior: imagenAnterior?.name,
        imagenNueva: nuevaImagen.name
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en PUT /api/imagen:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}