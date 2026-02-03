const { validationResult } = require('express-validator');
const ErrorHandler = require('./errorHandler');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array()
      .map(err => `${err.param}: ${err.msg}`)
      .join(', ');
    return next(new ErrorHandler(message, 400));
  }
  next();
};

module.exports = handleValidationErrors;
