import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

router.post('/api/admin/auth/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return
    }

    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      res.status(401).json({ message: 'Invalid email or password' });
      return
    }

    // Create Access Token
    const accessToken = jwt.sign({ id: admin.id, role: admin.role }, JWT_SECRET, {
      expiresIn: '15m',
    });

    // Create Refresh Token
    const refreshToken = jwt.sign({ id: admin.id }, REFRESH_TOKEN_SECRET, {
      expiresIn: '7d',
    });

    // Save the refresh token in AdminRefreshToken table
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await prisma.adminRefreshToken.create({
      data: {
        token: hashedRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        adminId: admin.id,
      },
    });

    // Set cookies for accessToken and refreshToken
    res.cookie('adminAccessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('adminRefreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: 'Admin login successful',
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({ message: 'An error occurred during admin login' });
  }
});

export default router;