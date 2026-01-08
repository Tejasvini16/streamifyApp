import express from 'express';
import { protectRoute } from '../middlewares/auth.middleware.js';

const router=express.Router();

import { getStreamToken } from "../controllers/chat.controller.js"
router.get("/token",protectRoute,getStreamToken);

export default router;