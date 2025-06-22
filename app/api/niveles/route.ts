// app/api/niveles/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const url = new URL(req.url);
    const nivel = url.searchParams.get("nivel");

    if (!nivel) {
      // Devuelve solo niveles distintos
      const niveles = await db.collection("Cursos").distinct("nivel");
      const nivelesFormateados = niveles.map((nivel: string) => ({
        nombre: nivel,
        ruta: '/' + nivel.toLowerCase().replace(/\s+/g, '')
      }));
      return NextResponse.json({ niveles: nivelesFormateados });
    } else {
      // Devuelve cursos filtrados por nivel (case insensitive)
      const cursos = await db
        .collection("Cursos")
        .find({ nivel: { $regex: new RegExp(`^${nivel}$`, "i") } })
        .toArray();

      return NextResponse.json({ cursos });
    }
  } catch (error) {
    console.error("❌ Error en /api/niveles:", error);
    return NextResponse.json({ error: "Error en la consulta" }, { status: 500 });
  }
}
