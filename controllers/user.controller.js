import User from "../models/User.js";

/* ======================
   👤 PROFIL UTILISATEUR
====================== */
export const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate({
      path: "couple",
      populate: {
        path: "users",
        select: "username avatar",
      },
    })
    .select("-password");

  res.json(user);
};
