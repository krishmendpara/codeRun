import http from 'http';
import 'dotenv/config'
import app from './app.js';


const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

app.get('/',(req,res)=>{
    res.send('JS and Python Compiler');
})

server.listen(PORT,(req,res)=>{
    console.log(`Server started at ${PORT}`);
})