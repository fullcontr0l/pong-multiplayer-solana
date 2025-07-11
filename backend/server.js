const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

mongoose.connect("mongodb://localhost:27017/pong-multiplayer", { useNewUrlParser: true, useUnifiedTopology: true });

const Result = mongoose.model("Result", {
  player1: String,
  player2: String,
  winner: String,
  timestamp: { type: Date, default: Date.now },
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("frontend"));

const waitingPlayers = [];

io.on("connection", socket => {
  console.log("New connection");

  socket.on("join-game", wallet => {
    socket.wallet = wallet;
    if (waitingPlayers.length > 0) {
      const opponent = waitingPlayers.pop();
      const room = socket.id + "#" + opponent.id;
      socket.join(room);
      opponent.join(room);
      io.to(room).emit("game-start", { players: [wallet, opponent.wallet] });
    } else {
      waitingPlayers.push(socket);
    }
  });

  socket.on("game-over", ({ winner, loser }) => {
    Result.create({ player1: winner, player2: loser, winner });
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
