const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  if (err.code === 429) {
    return res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Twitter API rate limit exceeded',
        retryAfter: err.retryAfter || 900,
        details: err.details || {}
      }
    });
  }

  if (err.code === 401) {
    return res.status(401).json({
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: 'Invalid Twitter API credentials',
        details: {}
      }
    });
  }

  if (err.code === 400) {
    return res.status(400).json({
      error: {
        code: 'INVALID_REQUEST',
        message: err.message || 'Invalid request parameters',
        details: err.details || {}
      }
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: err.details || {}
      }
    });
  }

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'An internal server error occurred' 
        : err.message,
      details: process.env.NODE_ENV === 'production' ? {} : { stack: err.stack }
    }
  });
};

module.exports = errorHandler;