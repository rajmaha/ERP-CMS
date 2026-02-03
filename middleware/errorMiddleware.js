const ErrorHandler = require('./errorHandler');

const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Wrong MongoDB ID error
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate field value entered`;
    err = new ErrorHandler(message, 400);
  }

  // JWT wrong signature error
  if (err.name === 'JsonWebTokenError') {
    const message = `Invalid token`;
    err = new ErrorHandler(message, 401);
  }

  // JWT expired error
  if (err.name === 'TokenExpiredError') {
    const message = `Token expired`;
    err = new ErrorHandler(message, 401);
  }

  // Validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map(val => val.message)
      .join(', ');
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorMiddleware;
