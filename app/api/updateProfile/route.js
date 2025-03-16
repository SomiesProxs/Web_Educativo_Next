import { MongoClient } from "mongodb";

export async function POST(req) {
  try {
    const { email, username, phone, birthDate, gender } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), { status: 400 });
    }

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    
    const db = client.db("SomiesProxs"); // Cambia esto por el nombre de tu base de datos
    const users = db.collection("Clientes"); // Cambia esto por el nombre de tu colección

    const result = await users.updateOne(
      { email: email },
      { $set: { username, phone, birthDate, gender } }
    );

    await client.close();

    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, message: "Profile updated successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error updating profile:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
