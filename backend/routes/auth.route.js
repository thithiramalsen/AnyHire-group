import express from "express";
import { login, logout, signup, refreshToken, getProfile, deleteAccount } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { updateProfile } from "../controllers/auth.controller.js";
import upload from "../lib/multer.js";
import {uploadPfp, deletePfp} from "../controllers/auth.controller.js";
import { upgradeToJobSeeker } from "../controllers/auth.controller.js";

const router = express.Router();

//router.post("/signup", signup);

router.post(
    "/signup",
    (req, res, next) => {
      console.log("Request received");
      console.log("Headers:", req.headers);
      console.log("Body:", req.body);
      next();
    },
    upload.single("image"),
    signup
  );
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/profile", protectRoute, getProfile);
router.put("/profile", protectRoute, updateProfile);
router.delete("/profile", protectRoute, deleteAccount);


router.post("/profile/pfp", protectRoute, upload.single("image"), uploadPfp); // Upload or update PFP
router.delete("/profile/pfp", protectRoute, deletePfp); // Delete PFP

router.post("/upgrade-role", protectRoute, upgradeToJobSeeker);

export default router;