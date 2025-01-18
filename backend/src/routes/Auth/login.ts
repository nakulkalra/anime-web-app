import { Router } from 'express';

const router:Router = Router();

// Define the /login route
router.post('/login', (req, res): void => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: 'Username and password are required' });
    return;
  }

  res.status(200).json({ message: 'Login successful', user: { username } });
});

export default router;
