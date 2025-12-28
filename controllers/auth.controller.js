import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";


/* 🔐 Générer un token */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};


/* ======================
   📝 INSCRIPTION
====================== */

export const register = async (req, res) => {
  
  const { username, email, password } = req.body;

  const userExists = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (userExists) {
    res.status(400);
    throw new Error("Utilisateur déjà existant");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  res.status(201).json({
    _id: user._id,
    username: user.username,
    email: user.email,
    token: generateToken(user._id),
  });
};


/* ======================
   🔑 CONNEXION
====================== */

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");


  if (!user) {
    res.status(401);
    throw new Error("Email ou mot de passe incorrect");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    res.status(401);
    throw new Error("Email ou mot de passe incorrect");
  }
  console.log("✅ Mot de passe correct", user);
  
   // 🔥 Populate le couple avec les utilisateurs
  await user.populate({
    path: "couple",
    
  });
  

  res.json({
  user: {
    _id: user._id,
    username: user.username,
    email: user.email,
    couple: user.couple,
    avatar: user.avatar,
    stats: user.stats,
    createdAt: user.createdAt,
  },
  token: generateToken(user._id),
});
  console.log("✅ Utilisateur connecté :", res);


};

export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-password")
    .populate({
      path: "couple",
      populate: {
        path: "users",
        select: "username email",
      },
    });

  res.json({user});
};



