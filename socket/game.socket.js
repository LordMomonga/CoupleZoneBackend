import { gameData } from "../data/actionVeriteData.js";
import { gameData as quiDeNousData } from "../data/QuiDeNous2.js";
import { shuffleArray } from "../utils/shufleArray.js";

const games = {}; // ✅ OBLIGATOIRE

export default (io, socket) => {
  const coupleRoom = socket.user?.couple?.toString();
  if (!coupleRoom) return;

  socket.join(coupleRoom);
  console.log(`${socket.user.username} a rejoint la room ${coupleRoom}`);

  // =====================
  // 👥 Update players
  // =====================
  const updatePlayers = () => {
    const clients = Array.from(
      io.sockets.adapter.rooms.get(coupleRoom) || []
    );

    const players = clients
      .map((id) => io.sockets.sockets.get(id))
      .filter(Boolean) // ✅ évite crash
      .map((s) => s.user.username);

    io.to(coupleRoom).emit("game:players", players);
  };

  // 🟢 à la connexion
  updatePlayers();

  // 🔴 à la déconnexion
  socket.on("disconnect", () => {
    console.log(`${socket.user.username} s'est déconnecté`);
    updatePlayers();
  });

  // =====================
  // 🎮 Start game
  // =====================
  socket.on("game:start", () => {
    const clients = [...(io.sockets.adapter.rooms.get(coupleRoom) || [])];
    if (clients.length < 2) {
      socket.emit("game:wait", "En attente d'un autre joueur...");
      return;
    }

    const randomId = clients[Math.floor(Math.random() * clients.length)];
  const firstPlayer =
    io.sockets.sockets.get(randomId)?.user.username;

  if (!firstPlayer) return;

    io.to(coupleRoom).emit("game:started", { firstPlayer});
  });

  // =====================
  // 🎯 Action / Vérité
  // =====================
  socket.on("action-verite:play", ({ type, niveau }) => {
    const data = gameData[niveau];
    if (!data) return;

    const list = type === "action" ? data.actions : data.verites;
    const question = list[Math.floor(Math.random() * list.length)];

    const clients = [...(io.sockets.adapter.rooms.get(coupleRoom) || [])];
    const randomId = clients[Math.floor(Math.random() * clients.length)];
    const player = io.sockets.sockets.get(randomId)?.user.username;

    if (!player) return;

    io.to(coupleRoom).emit("action-verite:result", {
      type,
      question,
      player,
    });
  });

  // =====================
  // 🧠 Qui de nous deux
  // =====================
  
  socket.on("qui-de-nous-deux:start", () => {

      if (games[coupleRoom]) return; // ⛔ empêche double start

    const clients = [...(io.sockets.adapter.rooms.get(coupleRoom) || [])];
    if (clients.length < 2) return;

    const players = clients
  .map(id => io.sockets.sockets.get(id))
  .filter(Boolean)
  .map(s => s.user.username);

games[coupleRoom] = {
  questions: [...shuffleArray(quiDeNousData)],
  votes: {},
  scores: {
    [players[0]]: 0,
    [players[1]]: 0,
  },
};


    sendNextQuestionQDnd(io, coupleRoom);
  });

  socket.on("qui-de-nous-deux:vote", (payload) => {
  // roomId = la room du couple
  const roomId = socket.user?.couple?.toString();
  if (!roomId) return;

  handleVoteQDnd(io, roomId, socket, payload);
});




// =====================
// 🔁 Next question
// =====================

function sendNextQuestionQDnd(io, roomId){
  const game = games[roomId];
  if (!game) return;

  if (game.questions.length === 0) {
    io.to(roomId).emit("qui-de-nous-deux:end", game.scores);
    delete games[roomId];
    return;
  }
  const question = game.questions.shift();

  game.votes = {};

  io.to(roomId).emit("qui-de-nous-deux:question", {
    question,
    scores: game.scores,
  });

}

function handleVoteQDnd(io, roomId, socket, { type }) {
  const game = games[roomId];
  if (!game) return;

  const voter = socket.user.username;

  // Empêche double vote
  if (game.votes[voter]) return;

  // Enregistre le vote
  game.votes[voter] = type;

  console.log("Vote reçu :", voter, type);

  // Quand les deux joueurs ont voté
  if (Object.keys(game.votes).length === 2) {
    Object.entries(game.votes).forEach(([player, voteType]) => {
      if (voteType === "moi") {
        game.scores[player] = (game.scores[player] || 0) + 1;
      }
    });

    console.log("Votes:", game.votes);
    console.log("Scores:", game.scores);
    console.log("Questions restantes:", game.questions.length);

    sendNextQuestionQDnd(io, roomId);
  }

  io.to(roomId).emit("qui-de-nous-deux:update-scores", game.scores);
}


}