import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import prisma from './lib/prisma';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { UserPayload } from './types/express';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const ACCESS_TOKEN_EXPIRY = '1m'; // Access token expiry
const REFRESH_TOKEN_EXPIRY = '7d'; // Refresh token expiry

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    email: string;
    name: string | null;
    id: number;
    createdAt: Date;
    updatedAt: Date;
  };
}

export async function signup(email: string, password: string, name: string) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const userData: Prisma.UserCreateInput = {
      email,
      name,
      password: hashedPassword,
    };

    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = await generateAndSaveRefreshToken(user.id);

    return { accessToken, refreshToken, user };
  } catch (error: any) {
    throw new Error(error.message || 'Signup failed');
  }
}

export async function login(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new Error('User not found');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error('Invalid password');

    const { password: _, ...userWithoutPassword } = user;
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = await generateAndSaveRefreshToken(user.id);

    return { accessToken, refreshToken, user: userWithoutPassword };
  } catch (error: any) {
    throw new Error(error.message || 'Login failed');
  }
}

function generateAccessToken(userId: number, email: string) {
  return jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

async function generateAndSaveRefreshToken(userId: number) {
  const refreshToken = jwt.sign({ id: userId }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
  const hashedToken = await bcrypt.hash(refreshToken, 10);

  await prisma.refreshToken.create({
    data: {
      token: hashedToken,
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  });

  return refreshToken;
}
export const authenticate: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    console.log('[DEBUG] Cookies received:', {
      accessToken: accessToken ? 'present' : 'missing',
      refreshToken: refreshToken ? 'present' : 'missing',
    });

    if (!accessToken && refreshToken) {
      console.log('[DEBUG] Access token missing, refresh token available. Attempting refresh flow...');
    }

    if (!accessToken) {
      if (!refreshToken) {
        console.log('[DEBUG] No tokens provided');
        res.status(401).json({ error: 'No tokens provided' });
        return;
      }

      console.log('[DEBUG] Refresh token detected. Validating...');
      try {
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        console.log('[DEBUG] Hashed refresh token for DB check:', hashedRefreshToken);

        const storedToken = await prisma.refreshToken.findFirst({
          where: {
            expiresAt: { gt: new Date() },
          },
          include: { user: true },
        });

        console.log('[DEBUG] Stored token found:', !!storedToken);
        if (storedToken) {
          console.log('[DEBUG] Stored token details:', {
            token: storedToken.token,
            userId: storedToken.userId,
            expiresAt: storedToken.expiresAt,
          });
        }

        if (!storedToken || !(await bcrypt.compare(refreshToken, storedToken.token))) {
          console.log('[DEBUG] Refresh token validation failed');
          res.status(401).json({ error: 'Invalid refresh token' });
          return;
        }

        console.log('[DEBUG] Refresh token validated successfully');
        const decodedRefresh = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as UserPayload;

        console.log('[DEBUG] Refresh token decoded:', decodedRefresh);
        const newAccessToken = generateAccessToken(decodedRefresh.id, storedToken.user.email);

        console.log('[DEBUG] New access token generated:', newAccessToken);

        res.cookie('accessToken', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 1000, // 1 minute for testing
        });

        req.user = {
          id: storedToken.user.id,
          email: storedToken.user.email,
        };

        next();
      } catch (refreshError) {
        console.log('[DEBUG] Error validating refresh token:', refreshError);
        res.status(401).json({ error: 'Invalid or expired refresh token' });
      }
    } else {
      try {
        console.log('[DEBUG] Attempting to verify access token...');
        const decoded = jwt.verify(accessToken, JWT_SECRET) as UserPayload;

        console.log('[DEBUG] Access token verified successfully:', decoded);
        req.user = decoded;
        next();
      } catch (error) {
        console.log('[DEBUG] Access token verification failed:', error);
        res.status(401).json({ error: 'Invalid or expired access token' });
      }
    }
  } catch (error) {
    console.error('[DEBUG] Middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

