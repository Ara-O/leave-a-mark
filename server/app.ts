import { Server } from "socket.io";
import express from "express";
import { createServer } from "http";
import { MongoClient, ServerApiVersion, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.get("/health", (req, res) => {
  res.send("Healthy :D");
});

let mongoURL = process.env.MONGO_URI;
const client = new MongoClient(mongoURL || "", {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let conn: MongoClient;

(async function () {
  try {
    conn = await client.connect();
    await client.db("main").command({ ping: 1 });
    console.log("Successfully connected to MongoDB!");
  } catch (err: any) {
    console.log(err);
  }
})();

async function storePathInDB(path: any) {
  try {
    let collection = conn.db("main").collection("paths");
    await collection.insertOne(path);
  } catch (err) {
    console.log(err);
  }
}

async function retrievePathsFromDb(): Promise<any> {
  try {
    if (!conn) return;
    let collection = conn.db("main").collection("paths");
    let cursor = await collection.find({}, { projection: { _id: 0 } });

    let results = await cursor.toArray();
    return results;
  } catch (err) {
    console.log(err);
  }
}

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    // allowedHeaders: "*",
    credentials: true,
  },
});

io.on("connection", async (socket) => {
  // Retrieving path from database once the user connects
  console.log("A user joined");
  let retrievedPaths = await retrievePathsFromDb();
  socket.emit("retrieve-path", retrievedPaths);

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });

  socket.on("path-drawn", (path) => {
    console.log("Someone drew something");
    socket.broadcast.emit("new-path", path);

    storePathInDB(path);
  });
});

console.log("Listening on port 3000");
httpServer.listen(3000);
