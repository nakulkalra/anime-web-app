import express, { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
import login from './routes/auth/login';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes

// Use routes
app.use('/', login);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send({
        status: 'error',
        message: 'Something went wrong!',
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
