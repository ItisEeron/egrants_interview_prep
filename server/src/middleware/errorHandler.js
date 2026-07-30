export function notFound(req, res) {
  res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
}

// Express identifies error handlers by arity, so `next` must stay in the signature.
export function errorHandler(error, req, res, next) {
  console.error(error);
  res.status(error.status || 500).json({ error: error.message || 'Internal server error' });
}
