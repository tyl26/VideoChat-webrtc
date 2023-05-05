require('dotenv').config()
const path = require("path");
const express = require("express");
const http = require("http");
const socket = require("socket.io");

const app = express();
const server = http.createServer(app);
const socketServers = {
  cors: {
    origin: "*",
  },
};

const io = socket(server, socketServers);
app.use(express.static(path.join(__dirname, "public")));

const connectedUsers = {};
io.on("connection", (socket) => {
  socket.emit("msg", "we are connected!");
  // Server-side code

  socket.on("joinRoom", (room, username) => {
    if (connectedUsers[room]) {
      connectedUsers[room].push(socket.id);
    } else {
      connectedUsers[room] = [socket.id];
    }

    console.log(connectedUsers[room]);

    const otherUsers = connectedUsers[room].filter((id) => id !== socket.id);

    if (otherUsers) {
      //   console.log(otherUsers);
      socket.emit("otherUsersJoined", otherUsers);
    }

    socket.on("offer", (data) => {
      io.to(data.target).emit("offer", data, username);
    });
    socket.on("answer", (data) => {
      io.to(data.target).emit("answer", data, username);
    });
    socket.on("candidate", (data) => {
      io.to(data.target).emit("candidate", data);
    });

    socket.broadcast.emit("sharescreen", socket.id);

    socket.on("disconnect", () => {
      socket.broadcast.emit("endcall", socket.id);

      console.log(connectedUsers[room]);

      let updateRoom = connectedUsers[room];
      updateRoom = updateRoom.filter((id) => id !== socket.id);
      connectedUsers[room] = updateRoom;
      console.log(connectedUsers[room]);
    });
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("listening on port " + PORT);
});
