const mongoose = require('mongoose');
const APIError = require('../utils/apiError');

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof APIError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      details: error.details
    });
  }

  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      success: false,
      message: 'Invalid resource identifier'
    });
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      details: Object.values(error.errors).map((fieldError) => fieldError.message)
    });
  }

  if (error && error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate value detected'
    });
  }

  console.error(error);
  return res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
}

module.exports = {
  errorHandler
};
