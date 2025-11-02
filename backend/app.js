import express from 'express';
import connect from './db/db.js';
import cors from 'cors'
import cookieParser from 'cookie-parser'
import userRoute from './routes/user.route.js'
import codeRoute from './routes/code.route.js'
const app = express();

connect();
const allowedOrigins = [
  'http://localhost:4173',  // Vite dev server (local development)
  'https://coderunapp.vercel.app'  // ⚠️ REPLACE WITH YOUR REAL FRONTEND URL
];
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like Postman, mobile apps)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true  // Important if you're using cookies
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.use('/user', userRoute);
app.use('/code', codeRoute);


export default app;