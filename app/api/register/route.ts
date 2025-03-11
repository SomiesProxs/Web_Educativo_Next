// Función para manejar el registro de usuarios en la base de datos
import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  let client: MongoClient | null = null;
  try {
    const { username, email, password, dni, phone } = await req.json();
    if (!username || !email || !password || !dni || !phone) {
      return NextResponse.json({}, { status: 400 });
    }

    client = new MongoClient(process.env.MONGODB_URI as string);
    await client.connect();
    const db = client.db(process.env.MONGODB_DB);
    const ClientesCollection = db.collection("Clientes");

    const emailLowerCase = email.toLowerCase();
    if (await ClientesCollection.findOne({ email: emailLowerCase })) {
      return NextResponse.json({}, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await ClientesCollection.insertOne({
      username,
      email: emailLowerCase,
      password: hashedPassword,
      dni,
      phone,
      createdAt: new Date(),
    });

    return NextResponse.json({}, { status: 201 });
  } catch (error) {
    console.error("Error en el registro:", error);
    return NextResponse.json({}, { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
}
