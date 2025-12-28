import jwt from "jsonwebtoken";
import User from "../models/User.js";
import gameSocket from "./game.socket.js";


export default (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) return next(new Error("No token"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.user.username);

    // 👉 Rejoindre la room du couple
    if (socket.user.couple) {
      socket.join(socket.user.couple.toString());
      console.log(
        `💑 ${socket.user.username} joined couple room`
      );
    }

    // Charger les sockets de jeu
    gameSocket(io, socket);

    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.user.username);
    });
  });
};
