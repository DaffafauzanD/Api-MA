const jwt = require('jsonwebtoken');

// Secret key for JWT verification - should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || '30291049123asd1234DAwe';

function authMiddleware(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');
  
  // Check if no token
  if (!token) {
    return res.status(401).json({
      status: 401,
      message: 'No token, authorization denied'
    });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user from payload to request
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      status: 401,
      message: 'Token is not valid'
    });
  }
}

// Admin-only middleware
function adminOnly(req, res, next) {
  if (!req.user.is_admin) {
    return res.status(403).json({
      status: 403,
      message: 'Admin access required'
    });
  }
  next();
}

module.exports = {
  authMiddleware,
  adminOnly
};