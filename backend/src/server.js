import express from 'express';
const app = express();

import cors from 'cors';
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true // allow frontend to send cookies
}));

import dotenv from 'dotenv';
dotenv.config();// Load environment variables
const PORT = process.env.PORT || 5001;


import authRoutes from './routes/auth.routes.js';
app.use(express.json()); // Middleware to parse JSON bodies
import cookieParser from 'cookie-parser';
app.use(cookieParser()); // Middleware to parse cookies
app.use("/api/auth", authRoutes);

import userRoutes from './routes/user.routes.js';
app.use("/api/users",userRoutes);

import chatRoutes from "./routes/chat.routes.js";
app.use("/api/chat",chatRoutes);

//**PRODUCTION**
import path from "path";
const __dirname=path.resolve();

if(process.env.NODE_ENV=="production"){
    //convert "dist" folder to static asset
    app.use(express.static(path.join(__dirname,"../frontend/dist")));
    //merge backend(api's) and frontend(react)
    app.get("*",(req,res)=>{//"*"=> any route other than our created api's, we serve our react appl.
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    })
}

import { connectDB } from './lib/db.js';
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
    connectDB();
})