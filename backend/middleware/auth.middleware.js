import redisClient from "../service/redis.service.js";
import jwt from 'jsonwebtoken';

export const authUser = async (req,res,next)=>{
   try{
      const token = req.cookies.token || req.headers.authorization.split(' ')[1];

      if(!token){
        return res.status(401).json({message:"Unauthorized user"});

      }
      const isBlacklisted = await redisClient.get(token);
      if(isBlacklisted){
        return res.status(401).json({message:"Unauthorized user"});
      }
      const secret = process.env.JWT_SECRET;
      const decoded = jwt.verify(token,secret);
      req.user = decoded;
      next();

   }catch(err){
    console.log(err)
     res.status(500).json({message:err.message});
   }    
}
