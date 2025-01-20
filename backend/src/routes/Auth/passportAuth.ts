
import express, { Router } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../../lib/prisma';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { UserPayload } from '../../types/express';


const router:Router = express.Router();

// Google Authentication
router.get("/auth/google", passport.authenticate("google", { scope: [ "email"] }));

// Discord Authentication
router.get("/auth/discord", passport.authenticate("discord", { scope: ["identify", "email"] }));


router.get("/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  async (req, res) => {
    try {
      const user = req.user as UserPayload;
      console.log("User authenticated:", user);

      // Generate the access token for the user
      const accessToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, {
        expiresIn: "1h",
      });
      console.log("Access token generated:", accessToken);

      // Generate a raw refresh token
      const rawRefreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: "7d" });
      console.log("Raw refresh token:", rawRefreshToken);

      // Save the raw refresh token to the database (no hashing)
      await prisma.refreshToken.create({
        data: {
          token: rawRefreshToken,  // Store raw refresh token directly in the DB
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
      console.log("Refresh token saved to database");

      // Set cookies for access and refresh tokens
      res.cookie("accessToken", accessToken, { httpOnly: true });
      res.cookie("refreshToken", rawRefreshToken, { httpOnly: true });
      console.log("Cookies set");

      res.redirect("http://localhost:3000/");
    } catch (error) {
      console.error("Error in /auth/google/callback:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);
router.get("/auth/discord/callback",
  passport.authenticate("discord", {
    failureRedirect: "/login",
    session: false,
  }),
  async (req, res) => {
    try {
      const user = req.user as UserPayload;
      console.log("User authenticated via Discord:", user);

      // Generate the access token for the user
      const accessToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, {
        expiresIn: "1h",
      });
      console.log("Access token generated:", accessToken);

      // Generate a raw refresh token
      const rawRefreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: "7d" });
      console.log("Raw refresh token:", rawRefreshToken);

      // Save the raw refresh token to the database (no hashing)
      await prisma.refreshToken.create({
        data: {
          token: rawRefreshToken, // Store raw refresh token directly in the DB
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
      console.log("Refresh token saved to database");

      // Set cookies for access and refresh tokens
      res.cookie("accessToken", accessToken, { httpOnly: true });
      res.cookie("refreshToken", rawRefreshToken, { httpOnly: true });
      console.log("Cookies set");

      res.redirect("http://localhost:3000/"); // Redirect to your frontend
    } catch (error) {
      console.error("Error in /auth/discord/callback:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);


export default router;