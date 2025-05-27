const UserModel = require('../model/UserModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // npm install jsonwebtoken

// Secret key for JWT signing - should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || '30291049123asd1234DAwe';

async function login(username, password) {
  // Find user by username
  const user = await UserModel.findUserByUsername(username);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password_hash);
  
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }
  
  // Create JWT token
  const token = jwt.sign(
    { id: user.id, username: user.username, is_admin: user.is_admin },
    JWT_SECRET,
    { expiresIn: '1d' } // Token expires in 1 day
  );
  
  // Don't return the password
  const { password_hash: _, ...userWithoutPassword } = user;
  
  return {
    user: userWithoutPassword,
    token
  };
}

async function register(userData) {
  // Check if user already exists
  const existingUser = await UserModel.findUserByUsername(userData.username);
  
  if (existingUser) {
    throw new Error('Username already exists');
  }
  
  // Create new user
  return await UserModel.createUser(userData);
}

async function getUserProfile(userId) {
  return await UserModel.findUserById(userId);
}

async function changePassword(userId, currentPassword, newPassword) {
  // Find user by ID
  const user = await UserModel.findUserById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Get complete user data to access password hash
  const fullUser = await UserModel.findUserByUsername(user.username);
  
  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, fullUser.password_hash);
  
  if (!isMatch) {
    throw new Error('Current password is incorrect');
  }
  
  // Change password
  return await UserModel.changePassword(userId, newPassword);
}


module.exports = {
  login,
  register,
  getUserProfile,
    changePassword
};