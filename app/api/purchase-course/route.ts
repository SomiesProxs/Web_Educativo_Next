// app/api/purchase-course/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const { userId, nivel, curso, titulo, cost } = await request.json();
    
    if (!userId || !nivel || !curso || !titulo || !cost) {
      return NextResponse.json(
        { success: false, message: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Verificar que el usuario existe y tiene suficientes estrellas
    const user = await db.collection('Clientes').findOne({ 
      _id: new ObjectId(userId) 
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // CRÍTICO: Verificar estrellas actuales del usuario
    const currentStars = user.stars || 0;
    console.log(`=== PURCHASE DEBUG ===`);
    console.log(`User ID: ${userId}`);
    console.log(`Current stars in DB: ${currentStars}`);
    console.log(`Required cost: ${cost}`);
    console.log(`======================`);

    if (currentStars < cost) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Estrellas insuficientes. Tienes ${currentStars} somicoins y necesitas ${cost}`,
          currentStars // Enviar las estrellas actuales para actualizar el frontend
        },
        { status: 400 }
      );
    }

    // Verificar si ya compró este curso
    const existingPurchase = await db.collection('CoursesPurchased').findOne({
      userId: new ObjectId(userId),
      nivel,
      curso,
      titulo
    });

    if (existingPurchase) {
      return NextResponse.json(
        { success: false, message: 'Ya has comprado este curso' },
        { status: 400 }
      );
    }

    // Iniciar transacción
    const session = client.startSession();
    
    try {
      let finalRemainingStars = 0;
      
      await session.withTransaction(async () => {
        // Descontar estrellas del usuario
        const updateResult = await db.collection('Clientes').updateOne(
          { _id: new ObjectId(userId) },
          { $inc: { stars: -cost } },
          { session }
        );
        
        if (updateResult.matchedCount === 0) {
          throw new Error('No se pudo actualizar los somicoins del usuario');
        }

        // Registrar la compra
        await db.collection('CoursesPurchased').insertOne({
          userId: new ObjectId(userId),
          nivel,
          curso,
          titulo,
          cost,
          purchaseDate: new Date(),
          status: 'active'
        }, { session });
      });

      // Obtener las estrellas actualizadas después de la transacción
      const updatedUser = await db.collection('Clientes').findOne({
        _id: new ObjectId(userId)
      });

      finalRemainingStars = updatedUser?.stars || 0;
      
      console.log(`=== PURCHASE SUCCESS ===`);
      console.log(`Stars after purchase: ${finalRemainingStars}`);
      console.log(`========================`);

      return NextResponse.json({
        success: true,
        message: 'Curso comprado exitosamente',
        remainingStars: finalRemainingStars
      });

    } finally {
      await session.endSession();
    }

  } catch (error) {
    console.error('Error al comprar curso:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}