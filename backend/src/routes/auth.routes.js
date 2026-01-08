import express from 'express';

const router = express.Router();

import { signup, login, logout, onboard } from '../controllers/auth.controller.js';
import { protectRoute } from '../middlewares/auth.middleware.js';
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post("/onboarding",protectRoute,onboard);
//check if the user is logged in and return user details
router.get("/me", protectRoute, (req, res) => {
  res.status(200).json({
    user: req.user, // The user object is appended to the request by the protectRoute middleware
  });
});

export default router;