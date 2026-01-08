import { upsertStreamUser } from '../lib/stream.js';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

export const signup =async (req, res) => {
  const {fullName,email,password}=req.body;
  try {
    //response 400 for bad request
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if(password.length < 4) {
      return res.status(400).json({ message: 'Password must be at least 4 characters long' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const index=Math.floor(Math.random() * 100)+1;// generate a number between 1 and 100
    const randomAvatar=`https://avatar.iran.liara.run/public/${index}.png`;

    const newUser = new User({
      fullName,
      email,
      password,
      profilePic: randomAvatar
    });

    await newUser.save();//save the user to the database

    //Create the user in stream as well
    try{
        await upsertStreamUser({
            id: newUser._id.toString(), // Use the user's MongoDB ID
            name: newUser.fullName,
            image: newUser.profilePic || ""
        });
        console.log('Stream user created for: ', newUser.fullName);
    }
    catch (error) {
      console.error('Error creating user in Stream:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    const token= jwt.sign(
      { userId: newUser._id },//payload
      process.env.JWT_SECRET,// secret key from .env file
      { expiresIn: '1h' }// token expiration time
    );
    res.cookie('accessToken', token, {
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      sameSite: 'Strict', // Helps prevent CSRF attacks
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000 // 1 hour in milliseconds
    });

    res.status(201).json({//response 201 for successful creation
      message: 'User created successfully',
      user: newUser
    });

  } 
  catch (error) {
    console.error('Error during signup:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export const login =async (req, res) => {
  try{
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Invalid Credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid Credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('accessToken', token, {
      httpOnly: true,
      sameSite: 'Strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000 // 1 hour
    });

    res.status(200).json({
      message: 'Login successful',
      user: user
    });
  }
  catch{
    error => {
      console.error('Error during login:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export const logout =(req, res) => {
  res.clearCookie('accessToken');
  res.status(200).json({ message: 'Logout successful' });
}

export const onboard =async (req, res) => {
  //req object has user appended to it by the protectRoute middleware
  try{
    const {fullName,bio,nativeLanguage,learningLanguage,location}=req.body;
    if( !fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
      return res.status(400).json({ message: 'All fields are required',
        missingFields: [
            !fullName && 'fullName',
            !bio && 'bio',
            !nativeLanguage && 'nativeLanguage',
            !learningLanguage && 'learningLanguage',
            !location && 'location'
        ].filter(Boolean) // Filter out undefined values
       });
    }
    // Update the user in the database
    const updatedUser=await User.findByIdAndUpdate(req.user._id, {
        ...req.body, // Spread the request body to update all fields
        isOnboarded: true   
    }, { new: true });// new: true returns the updated user
    if(!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      message: 'Onboarding successful',
      user: updatedUser
    });
    // Update the user in Stream as well
    try{
        await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePic || ""
        });
        console.log('Stream user updated for: ', updatedUser.fullName);
    }
    catch (error) {
      console.error('Error updating user in Stream:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  catch (error) {
    console.error('Error during onboarding:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}