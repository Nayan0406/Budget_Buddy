const express = require('express');
const { register, login, getProfile, updateProfile, upload, forgotPassword } = require('../controller/authController');

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const router = express.Router();

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Password reset routes
router.post('/forgot-password', forgotPassword);

// Profile routes
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, upload.single('profileImage'), updateProfile);

module.exports = router;