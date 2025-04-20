import { MongoClient, Db, Collection } from "mongodb";

// Cached connection
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

// Connect to MongoDB
async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(process.env.MONGODB_URI as string);
  await client.connect();
  const db = client.db("SomiesProxs");
  
  cachedClient = client;
  cachedDb = db;
  
  return { client, db };
}

export async function GET(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const searchQuery = url.searchParams.get("search") || "";
    
    const usersPerPage = 5;
    const skip = (page - 1) * usersPerPage;
    
    // Connect to database
    const { db } = await connectToDatabase();
    const usersCollection: Collection = db.collection("Clientes");
    
    // Create search query
    const query = searchQuery
      ? { 
          $or: [
            { username: { $regex: searchQuery, $options: "i" } }, 
            { email: { $regex: searchQuery, $options: "i" } }
          ] 
        }
      : {};
    
    // Only request the fields we need
    const projection = {
      username: 1,
      email: 1,
      phone: 1,
      stars: 1,
      theme: 1
    };
    
    // Execute query with pagination
    const users = await usersCollection
      .find(query)
      .project(projection)
      .skip(skip)
      .limit(usersPerPage)
      .toArray();
    
    // Get total count for pagination
    const totalUsers = await usersCollection.countDocuments(query);
    
    return new Response(
      JSON.stringify({
        users,
        totalUsers,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / usersPerPage)
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}