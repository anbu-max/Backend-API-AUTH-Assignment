const express = require('express');
const AuthService = require('../../services/authService');
const { ValidationError } = require('../../exceptions/ApplicationError');
const AuthMiddleware = require('../../middleware/auth.middleware');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const result = await AuthService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ValidationError('Email and password required');
    }
    const result = await AuthService.login(email, password);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.get('/verify', AuthMiddleware.verifyToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;
