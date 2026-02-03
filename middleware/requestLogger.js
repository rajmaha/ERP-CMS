const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    }
  });

  next();
};

module.exports = requestLogger;
