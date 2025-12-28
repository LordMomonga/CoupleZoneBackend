import Couple from "../models/Couple.js";
import User from "../models/User.js";

/* 🔐 Générer un code unique */
const generateCoupleCode = () => {
  return "CPZ-" + Math.random().toString(36).substring(2, 7).toUpperCase();
};

/* ======================
   💕 CRÉER UN COUPLE
====================== */
export const createCouple = async (req, res) => {
  const user = req.user;


  if (user.couple) {
    res.status(400);
    throw new Error("Vous êtes déjà dans un couple");
  }

  const couple = await Couple.create({
    users: [user._id],
    coupleCode: generateCoupleCode(),
  });

  user.couple = couple._id;
  await user.save();

  res.status(201).json({
    message: "Couple créé",
    coupleCode: couple.coupleCode,
  });
};

/* ======================
   🔗 REJOINDRE UN COUPLE
====================== */
export const joinCouple = async (req, res) => {
  const { coupleCode } = req.body;
  const user = req.user;

  if (user.couple) {
    res.status(400);
    throw new Error("Vous êtes déjà dans un couple");
  }

  const couple = await Couple.findOne({ coupleCode });

  if (!couple) {
    res.status(404);
    throw new Error("Code de couple invalide");
  }

  if (couple.users.length >= 2) {
    res.status(400);
    throw new Error("Ce couple est déjà complet");
  }

  couple.users.push(user._id);
  await couple.save();

  user.couple = couple._id;
  await user.save();

  res.json({
    message: "Couple rejoint avec succès",
  });
};
