import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI as string;

if (!uri) {
  throw new Error("MONGODB_URI no está definido en .env");
}

const client = new MongoClient(uri);
const clientPromise = client.connect();

export default clientPromise;
