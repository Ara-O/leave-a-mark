import { Server } from "socket.io";
import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.get("/health", (req, res) => {
  res.send("Healthy :D");
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    // allowedHeaders: "*",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("A user joined - ", socket.id);

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });

  socket.on("path-drawn", (path) => {
    console.log("Someone drew something");
    socket.broadcast.emit("new-path", path);
  });
});

console.log("Listening on port 3000");
httpServer.listen(3000);
