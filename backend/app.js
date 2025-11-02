import express from 'express';
import connect from './db/db.js';
import cors from 'cors'
import cookieParser from 'cookie-parser'
import userRoute from './routes/user.route.js'
import codeRoute from './routes/code.route.js'
const app = express();

connect();
const allowedOrigins = [
    'http://localhost:4173',  
    'https://code-run-nine.vercel.app',
    'https://coderunapp.vercel.app'  
];
app.use(cors({
  origin: true,  // Allows ALL origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/user', userRoute);
app.use('/code', codeRoute);


export default app;