const express = require('express');
const router = express.Router();
const UserService = require('../services/UserServices');
const { authMiddleware, adminOnly } = require('../middleware/auth/MiddlewareUser');

// Register new admin (you might want to protect this route)
router.post('/register', async (req, res) => {
  try {
    const userData = {
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      fullname: req.body.fullname,
      is_admin: true // Always create as admin
    };
    
    const newUser = await UserService.register(userData);
    
    res.status(201).json({
      status: 201,
      message: 'Admin user registered successfully',
      data: newUser
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const result = await UserService.login(username, password);

    // Atur token sebagai HTTP-Only cookie
    res.cookie('authToken', result.token, {
      httpOnly: true, // Cookie tidak bisa diakses oleh JavaScript sisi klien
      secure: process.env.NODE_ENV === 'production', // Kirim hanya melalui HTTPS di produksi
      sameSite: 'Lax', // Atau 'Strict' atau 'None' (jika 'None', 'secure' harus true)
      maxAge: 24 * 60 * 60 * 1000 // Masa berlaku cookie (misalnya 1 hari, sama dengan token)
    });
    
    res.status(200).json({
      status: 200,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    res.status(401).json({
      status: 401,
      message: 'Authentication failed',
      error: error.message
    });
  }
});

// Get user profile (protected route)
router.get('/profile', authMiddleware, adminOnly, async (req, res) => {
  try {
    const userId = req.user.id;
    const userProfile = await UserService.getUserProfile(userId);
    
    if (!userProfile) {
      return res.status(404).json({
        status: 404,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      status: 200,
      message: 'Profile retrieved successfully',
      data: userProfile
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Failed to retrieve profile',
      error: error.message
    });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('authToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax'
    // Anda juga bisa menambahkan path dan domain jika diset secara spesifik saat pembuatan cookie
  });
  res.status(200).json({
    status: 200,
    message: 'Logout successful'
  });
});

// Add this route to your UserController.js
router.put('/change_password', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 400,
        message: 'Current password and new password are required'
      });
    }
    
    // Password validation (you may want to strengthen this)
    if (newPassword.length < 6) {
      return res.status(400).json({
        status: 400,
        message: 'New password must be at least 6 characters long'
      });
    }
    
    // Change password
    const updatedUser = await UserService.changePassword(userId, currentPassword, newPassword);
    
    res.status(200).json({
      status: 200,
      message: 'Password changed successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    // Determine appropriate status code based on error
    let statusCode = 500;
    if (error.message === 'User not found') {
      statusCode = 404;
    } else if (error.message === 'Current password is incorrect') {
      statusCode = 401;
    }
    
    res.status(statusCode).json({
      status: statusCode,
      message: 'Failed to change password',
      error: error.message
    });
  }
});

// For admin-only password reset (no current password required)
router.put('/admin/reset-password/:userId', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;
    
    // Validate input
    if (!newPassword) {
      return res.status(400).json({
        status: 400,
        message: 'New password is required'
      });
    }
    
    // Password validation
    if (newPassword.length < 6) {
      return res.status(400).json({
        status: 400,
        message: 'New password must be at least 6 characters long'
      });
    }
    
    // Reset password (admin bypass - no current password check)
    const updatedUser = await UserModel.changePassword(userId, newPassword);
    
    res.status(200).json({
      status: 200,
      message: 'Password reset successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    res.status(error.message === 'User not found' ? 404 : 500).json({
      status: error.message === 'User not found' ? 404 : 500,
      message: 'Failed to reset password',
      error: error.message
    });
  }
});

module.exports = router;