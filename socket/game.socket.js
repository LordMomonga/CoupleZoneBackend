import { gameData } from "../data/actionVeriteData.js";

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
};

