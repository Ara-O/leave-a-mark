import { Server } from "socket.io";
import express from "express";
import { createServer } from "http";

const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", (socket) => {
  console.log("A user joined - ", socket.id);

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });

  socket.on("path-drawn", (path) => {
    socket.broadcast.emit("new-path", path);
  });
});

httpServer.listen(3000);
