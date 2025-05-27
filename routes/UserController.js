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
router.get('/profile', authMiddleware, async (req, res) => {
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

module.exports = router;