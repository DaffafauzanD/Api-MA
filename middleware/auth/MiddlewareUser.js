// middleware/auth/MiddlewareUser.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || '30291049123asd1234DAwe';

function authMiddleware(req, res, next) {
  // Ambil token dari cookies
  const token = req.cookies.authToken; // Nama cookie yang kita atur saat login

  if (!token) {
    return res.status(401).json({
      status: 401,
      message: 'No token, authorization denied'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Tetap tambahkan user ke request
    next();
  } catch (error) {
    // Jika token tidak valid (misalnya kadaluarsa atau diubah), hapus cookie yang salah
    res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax'
    });
    res.status(401).json({
      status: 401,
      message: 'Token is not valid'
    });
  }
}

// adminOnly tetap sama
function adminOnly(req, res, next) {
  if (!req.user || !req.user.is_admin) { // Tambahkan pengecekan req.user
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