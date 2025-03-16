import { MongoClient } from "mongodb";

export async function POST(req) {
  try {
    const { email, image, username, phone, birthDate, gender } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), { status: 400 });
    }

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    
    const db = client.db("SomiesProxs");
    const users = db.collection("Clientes");

    // Construimos el objeto de actualización dinámicamente
    const updateFields = { username, phone, birthDate, gender };
    if (image) updateFields.image = image; // Solo actualiza la imagen si hay una nueva

    const result = await users.updateOne(
      { email: email },
      { $set: updateFields }
    );

    await client.close();

    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, message: "Profile updated successfully" }), { status: 200 });
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
