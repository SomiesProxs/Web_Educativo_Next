// app/api/check-course-access/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const nivel = searchParams.get('nivel');
    const curso = searchParams.get('curso');
    const titulo = searchParams.get('titulo');

    if (!userId || !nivel || !curso || !titulo) {
      return NextResponse.json(
        { success: false, message: 'Faltan parámetros requeridos' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Verificar si el usuario compró este curso
    const purchase = await db.collection('CoursesPurchased').findOne({
      userId: new ObjectId(userId),
      nivel,
      curso,
      titulo,
      status: 'active'
    });

    return NextResponse.json({
      success: true,
      hasPurchased: !!purchase,
      purchaseDate: purchase?.purchaseDate || null
    });

  } catch (error) {
    console.error('Error al verificar acceso:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}