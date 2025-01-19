import express, { Request, Response }  from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import login from './routes/Auth/login';
import auth from './routes/Auth/auth';
import cookieParser from 'cookie-parser';
import AdminAuth from './routes/Admin/auth/verify';
import AdminLogin from './routes/Admin/auth/login';
import passport from "passport";
import "./passportConfig";
import session from "express-session";
import PassportAuth from './routes/Auth/passportAuth';
 


dotenv.config();

const app = express();

  app.use(
    cors({
      origin: ['http://localhost:3000','http://localhost:3001'],
      credentials: true,
    })
  );




app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET || "siodhfoids")); 

app.use(
  session({
    secret: process.env.SESSION_SECRET!, // Use a secure secret
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize passport and session middleware
app.use(passport.initialize());
app.use(passport.session());
//Auth
app.use('/', auth);
app.use('/', login);
app.use('/', PassportAuth);

//Admin
app.use('/',AdminAuth);
app.use('/', AdminLogin);






app.get('/', (req:Request, res:Response) => {
  res.json({message:"Welcome to the Express server!"});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
