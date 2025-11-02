
import { validationResult } from "express-validator";
import userModel from "../models/user.model.js";
import * as userService from '../service/user.service.js'
import redisClient from "../service/redis.service.js";




 export const createUser = async (req,res)=>{
    const errors = validationResult(req);// isme errors aayenge agar validation me kuch gadbad hui to or validation ka matlab voh cheezein jo humne route me define ki hai jaise ki email valid hai ya password ki length sahi hai ya nahi 
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
      try{ 
        const {username , email , password} = req.body;
        const user = await userService.createUser({username , email , password});
        const token = await user.generatejwt();
        delete user._doc.password;
        return res.status(201).json({
            message: "User created successfully",
            user : user,
            token : token
        })
      }catch(err){
        return res.status(500).json({message:err.message});
      }
 }

 export const login = async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    
    try{
        const {email , password} = req.body;
        const user = await userModel.findOne({ email }).select('+password');         
        if (!user) {
            return res.status(401).json({ message: 'Invalid email' });  
        }

        const isMatch = await user.isValidPassword(password);   
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = await user.generatejwt();   
        delete user._doc.password;  
        res.status(200).json({ user, token });   


    }catch(err){
        return res.status(500).json({message:err.message});
    }
 
 }
 
 export const logout = async (req,res)=>{

     try{
         const token = req.cookies.token || req.headers.authorization.split(' ')[1];
         if(!token){
             return res.status(401).json({message:"Unauthorized user"});
         }
         redisClient.set(token,'logout','EX',60*60*24);
         res.status(200).json({message:"Logged out successfully"});

     }catch(err){
        console.error("Logout error:", err);
         return res.status(500).json({message:err.message});
     }
 

 }

 export const profile = async (req,res)=>{
    try{
        const user = await userModel.findById(req.user.id);
     
        if(!user){
            return res.status(404).json({message:"Unauthorized user"});
        }
        return res.status(200).json({user});
    }catch(err){
        return res.status(500).json({message:err.message});
    }
 
 }