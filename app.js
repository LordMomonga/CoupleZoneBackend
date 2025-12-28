import express from "express";
import cors from "cors"
import authRoutes from "./routes/auth.routes.js";
import coupleRoutes from "./routes/couple.routes.js";

const app = express();



app.use(cors({
    origin: "http://localhost:5173",
}));
app.use(express.json())

app.use("/api", authRoutes);
app.use("/api/couple", coupleRoutes);



app.get("/", (req, res) => {
  res.send("API CoupleZone ❤️");
});

export default app;