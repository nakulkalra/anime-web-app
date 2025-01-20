import cookieParser from 'cookie-parser';
import express, { RequestHandler, Router } from 'express';
import { z } from 'zod';
import { authenticate, login, signup } from '../../auth';
import prisma from '../../lib/prisma';

const router:Router = express.Router();
router.use(cookieParser(process.env.COOKIE_SECRET));

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(3),
});

// Login route
router.post('/api/auth/login', async (req, res) => {
  try {
    // Validate input
    const { email, password } = loginSchema.parse(req.body);
    
    // Attempt login
    const result = await login(email, password);
    
    // Set both tokens in cookies
    res.cookie('accessToken', result.accessToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 15 * 60 * 1000 // 15 minutes to match ACCESS_TOKEN_EXPIRY
    });
    
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days to match REFRESH_TOKEN_EXPIRY
    });
    
    // Return user data without sending tokens in response body
    res.json({ user: result.user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
    } else if (error instanceof Error) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Signup route
router.post('/api/auth/signup', async (req, res) => {
  try {
    // Validate input
    const { email, password, name } = signupSchema.parse(req.body);
    
    // Attempt signup
    const result = await signup(email, password, name);
    
    // Set both tokens in cookies
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000 // 15 minutes to match ACCESS_TOKEN_EXPIRY
    });
    
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days to match REFRESH_TOKEN_EXPIRY
    });
    
    // Return user data without sending tokens in response body
    res.status(201).json({ user: result.user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
    } else if (error instanceof Error) {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// const { PrismaClient } = require('@prisma/client');
// const bcrypt = require('bcrypt');
// const prisma = new PrismaClient();
router.post('/api/logout', async (req, res): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(400).json({ message: 'Refresh token not provided' });
      return;
    }

    // Find the refresh token in the database
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken, // Compare directly with the raw refresh token
        expiresAt: { gt: new Date() }, // Only consider non-expired tokens
      },
      orderBy: {
        expiresAt: 'desc', // Sort by expiration date in descending order
      },
    });

    if (!storedToken) {
      res.status(404).json({ message: 'No valid refresh token found in database' });
      return;
    }

    // Delete the matched refresh token from the database
    await prisma.refreshToken.delete({
      where: {
        id: storedToken.id,
      },
    });

    // Clear cookies
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: 'An error occurred during logout' });
  }
});



// Check session route handler
const checkSession: RequestHandler = (req, res) => {
  if (req.user) {
    res.status(200).json({ message: 'Logged In', user: req.user });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Route registration
router.get('/api/check-session', authenticate, checkSession);


export default router;