  import { NextResponse } from "next/server";
  import clientPromise from "@/lib/mongodb";
  import nodemailer from "nodemailer";

  export async function POST(req: Request) {
    try {
      const { email } = await req.json();

      if (!email) {
        return NextResponse.json({ message: "El correo es obligatorio" }, { status: 400 });
      }

      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB);
      const ClientesCollection = db.collection("Clientes");

      const user = await ClientesCollection.findOne({ email });

      if (!user) {
        return NextResponse.json({ message: "Correo no registrado" }, { status: 401 });
      }

      // Generar código de verificación de 6 dígitos
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Guardar el código en la base de datos temporalmente (expira en 5 minutos)
      await ClientesCollection.updateOne(
        { email },
        { $set: { verificationCode, codeExpires: Date.now() + 5 * 60 * 1000 } }
      );

      // Configurar transporte de correo
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Enviar el código de verificación
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Código de verificación",
          text: `Tu código de verificación es: ${verificationCode}`,
        });

        return NextResponse.json({ message: "Código enviado al correo", success: true }, { status: 200 });
      } catch (emailError) {
        console.error("Error al enviar el correo:", emailError);
        return NextResponse.json({ message: "Error al enviar el código de verificación" }, { status: 500 });
      }
    } catch (error) {
      console.error("Error en el servidor:", error);
      return NextResponse.json({ message: "Error en el servidor" }, { status: 500 });
    }
  }
