import express, { Request, Response }  from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import login from './routes/Auth/login';
import auth from './routes/Auth/auth';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    })
  );



app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET || "siodhfoids")); 


//Auth
app.use('/', auth)
app.use('/', login);






app.get('/', (req:Request, res:Response) => {
  res.json({message:"Welcome to the Express server!"});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
