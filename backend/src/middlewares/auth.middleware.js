import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protectRoute = async (req, res, next) => {
  //import cookie-parser in server.js to use cookies
  const token = req.cookies.accessToken;

  //response 401 for unauthorized access
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized access' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //in token w ehave a payload with userId
    if (!decoded) {
      return res.status(403).json({ message: 'Forbidden access' });
    }
    //add user to request object
    req.user = await User.findById(decoded.userId).select('-password');
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(403).json({ message: 'Forbidden access' });
  }
}