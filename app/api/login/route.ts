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

    // Generar código de verificación de 6 dígitos (sin Math.random())
    const verificationCode = (Math.floor(Math.random() * 900000) + 100000).toString();

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
        to: email,  // Dirección de correo del destinatario
        subject: "Código de verificación",  // Asunto del correo
        html: `
<html>
    <head>
        <style>
            /* Asegúrate de que la página no tenga márgenes y se vea bien en todos los dispositivos */
            html, body {
                height: 100%;
                margin: 0;
                font-family: Arial, sans-serif;
                background-color: black;
                color: #9F7539;
            }
            .container {
                width: 100%;
                max-width: 400px; /* Ancho máximo */
                margin: 0 auto; /* Centra el contenedor */
                background-color: #222;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
                text-align: center; /* Centra los elementos dentro del contenedor */
            }

            h1 {
                color: #9F7539;
                margin: 20px 0;
                font-size: 40px;
            }

            .code {
                font-size: 30px; /* Aumenté el tamaño para mejor visibilidad */
                font-weight: bold;
                color: white;
                background-color: #9F7539;
                padding: 15px 30px;
                border-radius: 5px;
                display: inline-block;
                margin-top: 30px; /* Agregué un margen superior para separarlo más */
                text-align: center;
            }
        </style>
    </head>
    <body>
        <table class="container" role="presentation" cellpadding="0" cellspacing="0">
            <tr>
                <td style="vertical-align: middle; padding-top: 50px; padding-bottom: 50px;">
                    <h1>¡Tu código de verificación!</h1>
                    <p class="code">${verificationCode}</p>
                </td>
            </tr>
        </table>
    </body>
</html>
    `,  // Usar contenido HTML aquí en lugar de texto plano
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
