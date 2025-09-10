const express = require('express');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { validateUser } = require('../middleware/validation');

const router = express.Router();

// Register new user
router.post('/register', validateUser, async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });
    
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email or username already exists' });
    }
    
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      role: role || 'student',
    });
    
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'User created successfully',
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(409).json({ error: 'User with this email or username already exists' });
    } else if (error.name === 'SequelizeValidationError') {
      res.status(400).json({ error: error.errors[0].message });
    } else {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const user = await User.findOne({ where: { email } });
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValidPassword = await user.validatePassword(password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Update last login
    await user.update({ lastLogin: new Date() });
    
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  res.json(req.user.toJSON());
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    
    await req.user.update({
      firstName,
      lastName,
      email,
    });
    
    res.json({
      message: 'Profile updated successfully',
      user: req.user.toJSON(),
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      res.status(400).json({ error: error.errors[0].message });
    } else {
      console.error('Profile update error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

module.exports = router;