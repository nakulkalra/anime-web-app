import express, { Request, RequestHandler, Response, Router } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../../../lib/prisma';
import { adminAuthenticate, logAdminRole } from '../../../auth';

const router: Router = express.Router();

enum AdminRole {
  GOD = 'GOD',
  MANAGER = 'MANAGER',
  HELPER = 'HELPER',
}

// Function to create an admin
export async function createAdmin(email: string, password: string, role: AdminRole) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
    });

    console.log('Admin created:', newAdmin);
  } catch (error) {
    console.error('Error creating admin:', error);
  }
}


// Check session route handler
const checkSession: RequestHandler = (req, res) => {
  if (req.admin) {
    res.status(200).json({ message: 'Logged In', user: req.admin });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Route registration
router.get('/api/admin/check-session', adminAuthenticate, checkSession);

router.get('/api/admin/log-role', logAdminRole);




export default router;
