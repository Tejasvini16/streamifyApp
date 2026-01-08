import User from "../models/user.model.js";

export const getRecommendedUsers = async (req, res) => {
  try {
    //user is appended to req object by protectRoute middleware
    const currentUser=req.user;
    // Simulate fetching recommended users
    const recommendedUsers = await User.find({
        $and: [// Conditions to filter recommended users
          { _id: { $ne: currentUser._id } }, // Exclude current user, (ne=not equal)
          { _id: { $nin: currentUser.friends} }, // exclude friends of current user
          { isOnboarded: true } // Only include users who are onboarded
        ]
    });
    res.status(200).json({
      success: true,
      data: recommendedUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recommended users',
      error: error.message
    });
  }
}

export const getMyFriends = async (req, res) => {
  try {
    const myFriends = await User.find({
      _id: { $in: req.user.friends } // Fetch users whose IDs are in the current user's friends list
    });
    //myFriends is an array of user objects
    res.status(200).json({
      success: true,
      data: myFriends
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching friends',
      error: error.message
    });
  }
}

import FriendRequest from "../models/friendRequest.model.js";

export const sendFriendRequest = async (req, res) => {
  try {
    const { id:recipentId } = req.params; // Extract the user ID from the request parameters
    const myId = req.user.id; // Current user is appended to req object by protectRoute middleware

    //prevent sending friend request to self
    if (recipentId === myId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a friend request to yourself'
      });
    }

    // Check if the recipient exists
    const recipient = await User.findById(recipentId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if the user is already a friend
    const currentUser=req.user;
    if (currentUser.friends.includes(recipentId)) {
      return res.status(400).json({
        success: false,
        message: 'User is already your friend'
      });
    }

    // Check if a friend request has already been sent,
    // For this check we created a FriendRequest model
    const existingRequest=await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipentId }, // Current user sent to recipient
        { sender: recipentId, recipient: myId } // Recipient sent to current user
      ]
    });
    if(existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Friend request already sent'
      });
    }

    // Create a new friend request
    const newFriendRequest = new FriendRequest({
      sender: myId,
      recipient: recipentId
    });
    await newFriendRequest.save();
    res.status(201).json({
      success: true,
      message: 'Friend request sent successfully',
      data: newFriendRequest
    });
  } 
  catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending friend request',
      error: error.message
    });
  }
}

export const acceptFriendRequest = async (req,res)=>{
  try{
    const {id:requestId}=req.params;
    const friendRequest=await FriendRequest.findById(requestId);
    if(!friendRequest){
      return res.status(404).json({message:"Friend request not found"});
    }
    //verify if the current user is the recipient
    if(friendRequest.recipient.toString() != req.user.id){
      return res.status(403).json({message:"You are not authorised to accept this request"});
    }
    friendRequest.status="accepted";
    await friendRequest.save();

    // add each other to their friend list
    // $addtoSet: adds elements to array iff they don't exist
    await User.findByIdAndUpdate(friendRequest.sender,
      {
        $addToSet: {friends: friendRequest.recipient}
      }
    )
    await User.findByIdAndUpdate(friendRequest.recipient,
      {
        $addToSet: {friends: friendRequest.sender}
      }
    )
    res.status(200).json({message:"Friend Request Accepted"});
  }
  catch(error){
    console.error("Error in accepting Request: ",error.message);
    res.status(500).json({message:"Internal Server Error"});
  }
}

export const getFriendRequests = async (req,res) =>{
  try {
    const incomingRequests = await FriendRequest.find({
      recipient:req.user.id,
      status:"pending"
    }).populate("sender","fullName profilePic nativeLanguage learningLanguage");

    const acceptedRequests = await FriendRequest.find({
      sender:req.user.id,
      status:"accepted"
    }).populate("recipient","fullName profilePic");

    res.status(200).json({incomingRequests,acceptedRequests});
  } 
  catch (error) {
    console.error("Error in getting friend requests: ",error.message);
    res.status(500).json({message:"Internal Server Error"});
  }
}

export const getOutgoingFriendRequests =async (req,res) => {
  try {
    const outgoingRequests= await FriendRequest.find({
      sender:req.user.id,
      status:"pending"
    }).populate("recipient","fullName profilePic nativeLanguage learningLanguage");
    res.status(200).json(outgoingRequests);
  } 
  catch (error) {
    console.error("Error in getting outgoing friend requests", error.message);
    res.status(500).json({message:"Internal Server Error"});
  }
}