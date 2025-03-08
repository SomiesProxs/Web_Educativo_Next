import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI as string;
if (!uri) throw new Error("⚠️ MONGODB_URI no está definida en .env.local");

const globalWithMongo = global as unknown as { _mongoClientPromise?: Promise<MongoClient> };

if (!globalWithMongo._mongoClientPromise) {
  const client = new MongoClient(uri);
  globalWithMongo._mongoClientPromise = client.connect();
}

const clientPromise = globalWithMongo._mongoClientPromise;

export default clientPromise;
