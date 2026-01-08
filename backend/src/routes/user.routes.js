import express from 'express';

const router = express.Router();

import { protectRoute } from '../middlewares/auth.middleware.js';
router.use(protectRoute); // Protect all routes in this router

import { getRecommendedUsers, getMyFriends, sendFriendRequest, acceptFriendRequest, getFriendRequests, getOutgoingFriendRequests } from '../controllers/user.controller.js';
router.get("/",getRecommendedUsers);
router.get("/friends",getMyFriends);

router.post("/friend-request/:id",sendFriendRequest);
//Put -> to update friend list
router.put("/friend-request/:id/accept",acceptFriendRequest);

router.get("/friend-requests",getFriendRequests);
router.get("/outgoing-friend-requests",getOutgoingFriendRequests);

export default router;