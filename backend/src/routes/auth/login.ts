import express, { Router } from 'express';
const router: Router = express.Router();

// Example test route
router.get('/test', (req, res) => {
    res.status(200).json({ message: 'Hello from the test route!' });
});

export default router;
