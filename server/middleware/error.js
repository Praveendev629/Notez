function notFound(req, res) {
  res.status(404).json({ error: 'Route not found' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('[error]', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid identifier' });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: 'That value already exists' });
  }
  const status = err.statusCode || 500;
  const message =
    status >= 500 ? 'Something went wrong on the server' : err.message;
  res.status(status).json({ error: message });
}

module.exports = { notFound, errorHandler };