import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { username, email, password, dni, phone } = await req.json();

    if (!username || !email || !password || !dni || !phone) {
      return NextResponse.json({ message: "Todos los campos son obligatorios" }, { status: 400 });
    }

    const client = new MongoClient(process.env.MONGODB_URI as string);
    await client.connect();
    const db = client.db(process.env.MONGODB_DB);
    const usersCollection = db.collection("users");

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      await client.close();
      return NextResponse.json({ message: "El usuario ya existe" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await usersCollection.insertOne({ username, email, password: hashedPassword, dni, phone, createdAt: new Date() });

    await client.close();
    return NextResponse.json({ message: "Usuario registrado correctamente" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 });
  }
}
