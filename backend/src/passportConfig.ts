import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as DiscordStrategy } from "passport-discord";
import prisma from "./lib/prisma";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || null;

        if (!email) {
          return done(null, false); // Reject users without email
        }

        // Check if user exists with Google ID
        let user = await prisma.user.findUnique({
          where: { googleId: profile.id },
        });

        if (!user) {
          // Check if email is already associated with another account
          const existingUser = await prisma.user.findUnique({
            where: { email },
          });

          if (existingUser) {
            // Handle email already in use
            return done(
              new Error(
                "Email is already associated with another account. Please log in with the original method."
              ),
              undefined
            );
          }

          // Create a new user if email is not in use
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName,
              googleId: profile.id,
            },
          });
        }

        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      callbackURL: "/auth/discord/callback",
      scope: ["identify", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.email || null;

        if (!email) {
          return done(null, false); // Reject users without email
        }

        // Check if user exists with Discord ID
        let user = await prisma.user.findUnique({
          where: { discordId: profile.id },
        });

        if (!user) {
          // Check if email is already associated with another account
          const existingUser = await prisma.user.findUnique({
            where: { email },
          });

          if (existingUser) {
            // Handle email already in use
            return done(
              new Error(
                "Email is already associated with another account. Please log in with the original method."
              ),
              undefined
            );
          }

          // Create a new user if email is not in use
          user = await prisma.user.create({
            data: {
              email,
              name: profile.username,
              discordId: profile.id,
            },
          });
        }

        done(null, user);
      } catch (error) {
        done(error, undefined);
      }
    }
  )
);

passport.serializeUser<Express.User>((user, done) => {
  done(null, user.id);
});

passport.deserializeUser<number, Express.User>(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return done(null, undefined); // Use undefined instead of false
    }
    done(null, { id: user.id, email: user.email });
  } catch (error) {
    done(error, undefined); // Use undefined instead of false
  }
});
