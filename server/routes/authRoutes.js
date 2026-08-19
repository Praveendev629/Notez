const express = require('express');
const { register, login, me, logout } = require('../controllers/authController');
const {
  registerSchema,
  loginSchema,
  validate,
} = require('../validators/authValidators');
const { requireAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.get('/me', requireAuth, me);
router.post('/logout', requireAuth, logout);

module.exports = router;