const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken, cookieOptions } = require('../utils/token');

const register = async (req, res) => {
  const { name, email, password } = req.validated;
  const normalized = email.toLowerCase();

  const existing = await User.findOne({ email: normalized });
  // Do not reveal whether an account exists — same generic message for both.
  if (existing) {
    return res.status(409).json({ error: 'An account with that email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email: normalized, passwordHash });

  const token = signToken(user._id);
  res.cookie('token', token, cookieOptions());
  res.status(201).json({ user: user.toSafeJSON() });
};

const login = async (req, res) => {
  const { email, password } = req.validated;
  const normalized = email.toLowerCase();

  const user = await User.findOne({ email: normalized });
  // Same generic error regardless of whether the email exists or the password
  // is wrong, so responses never reveal account existence.
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = signToken(user._id);
  res.cookie('token', token, cookieOptions());
  res.json({ user: user.toSafeJSON() });
};

const me = async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(401).json({ error: 'Account not found' });
  }
  res.json({ user: user.toSafeJSON() });
};

const logout = (req, res) => {
  res.clearCookie('token', { ...cookieOptions(), maxAge: 0 });
  res.json({ success: true });
};

module.exports = { register, login, me, logout };