import { Server } from "socket.io";
import express from "express";
import { createServer } from "http";

const app = express();

const httpServer = createServer(app);

app.get("/health", (req, res) => {
  res.send("Healthy :D");
});

const io = new Server(httpServer, {
  cors: {
    // TODO: Change to env
    origin: "http://localhost:5173",
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
