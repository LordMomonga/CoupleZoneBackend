import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import socketInit from "./socket/socket.js";

dotenv.config();

/* ======================
   Connexion DB
===================== */
connectDB();

/* ======================
   Créer serveur HTTP
===================== */
const server = http.createServer(app);

/* ======================
   Lancer Socket.io
===================== */
const io = new Server(server, {
  cors: {
    origin: process.env.ADRESSE ||
    process.env.CLIENT_URL,
    
    methods: ["GET", "POST"],
  },
});

socketInit(io);

/* ======================
   Lancer serveur
===================== */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server + Socket.IO running on http://localhost:${PORT}`);
});
