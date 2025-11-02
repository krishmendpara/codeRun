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
    origin: function (origin, callback) {
        // Allow requests with no origin (Postman, mobile apps, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,           // Important for cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization']      // Allowed headers
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/user', userRoute);
app.use('/code', codeRoute);


export default app;