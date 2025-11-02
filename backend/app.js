import express from 'express';
import connect from './db/db.js';
import cors from 'cors'
import cookieParser from 'cookie-parser'
import userRoute from './routes/user.route.js'
import codeRoute from './routes/code.route.js'
const app = express();

connect();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.use('/user', userRoute);
app.use('/code', codeRoute);


export default app;