import { gameData } from "../data/actionVeriteData.js";
import { gameData as quiDeNousData } from "../data/QuiDeNous2.js";

export default (io, socket) => {
  const coupleRoom = socket.user?.couple?.toString();
  if (!coupleRoom) return;

  socket.join(coupleRoom);
  console.log(`${socket.user.username} a rejoint la room ${coupleRoom}`);

  // Notifier tout le monde dans la room de la liste des joueurs
  const updatePlayers = () => {
    const clients = Array.from(io.sockets.adapter.rooms.get(coupleRoom) || []);
    const players = clients.map((id) => io.sockets.sockets.get(id).user.username);
    io.to(coupleRoom).emit("game:players", players);
  };

  updatePlayers();

      updatePlayers();
  socket.on("disconnect", () => {
  console.log(`${socket.user.username} s'est déconnecté`);
  updatePlayers();
});

  // Début du jeu
  socket.on("game:start", () => {
    const clients = Array.from(io.sockets.adapter.rooms.get(coupleRoom) || []);
    if (clients.length < 2) {
      socket.emit("game:wait", "En attente d'un autre joueur...");
      return;
    }
    io.to(coupleRoom).emit("game:started");
  });

  // Exemple Action ou Vérité
  socket.on("action-verite:play", ({ type, niveau }) => {
    const data = gameData[niveau];
    if (!data) return;

    const list = type === "action" ? data.actions : data.verites;
    const question = list[Math.floor(Math.random() * list.length)];

    const clients = Array.from(io.sockets.adapter.rooms.get(coupleRoom) || []);
    const randomPlayerId = clients[Math.floor(Math.random() * clients.length)];
    const player = io.sockets.sockets.get(randomPlayerId).user.username;

    io.to(coupleRoom).emit("action-verite:result", { type, question, player });
  });


  // =====================
  // 🎮 Start game
  // =====================
 socket.on("qui-de-nous-deux:start", () => {
    const clients = [...(io.sockets.adapter.rooms.get(coupleRoom) || [])];
    if (clients.length < 2) {
      socket.emit("game:wait", "En attente d'un autre joueur...");
      return;
    }

    games[coupleRoom] = {
      questions: [...quiDeNousData],
      currentQuestion: "",
      currentTurn: clients[0],
      scores: {
        [clients[0]]: 0,
        [clients[1]]: 0,
      },
    };

    sendNextQuestion(io, coupleRoom);
  });



  // =====================
  // 📩 Answer
  // =====================
  socket.on("qui-de-nous-deux:answer", ({ answer }) => {
    const game = games[coupleRoom];
    if (!game) return;

    const players = Object.keys(game.scores);
    const otherPlayer = players.find((id) => id !== socket.id);

    if (answer === "moi") {
      game.scores[socket.id]++;
    } else {
      game.scores[otherPlayer]++;
    }

    // switch turn
    game.currentTurn = otherPlayer;

    sendNextQuestion(io, coupleRoom);
  });
};

// =====================
// 🔁 Next question
// =====================
function sendNextQuestion(io, roomId) {
  const game = games[roomId];
  if (!game) return;

  if (game.questions.length === 0) {
    io.to(roomId).emit("qui-de-nous-deux:end", game.scores);
    return;
  }

  const index = Math.floor(Math.random() * game.questions.length);
  const question = game.questions.splice(index, 1)[0];
  game.currentQuestion = question;

  io.to(roomId).emit("qui-de-nous-deux:question", {
    question,
    currentTurn: game.currentTurn,
    scores: game.scores,
  });
}
