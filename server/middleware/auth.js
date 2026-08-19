const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Authentication middleware.
 * Reads the JWT from an httpOnly cookie (production/same-origin) or from an
 * `Authorization: Bearer <token>` header (dev / non-cookie clients).
 * Always derives the current user from the verified token — never from the
 * request body/query — so ownership is enforced server-side.
 */
function requireAuth(req, res, next) {
  let token = null;
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.userId = decoded.userId;
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired or invalid' });
  }
}

module.exports = { requireAuth };