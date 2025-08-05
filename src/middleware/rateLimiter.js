const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message,
        retryAfter: Math.ceil(windowMs / 1000)
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        url: req.url,
        method: req.method,
        userAgent: req.get('User-Agent')
      });
      
      res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message,
          retryAfter: Math.ceil(windowMs / 1000)
        }
      });
    }
  });
};

const rateLimiterConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.SERVER_RATE_LIMIT_PER_MINUTE) || 10
};

const rateLimiter = createRateLimiter(
  rateLimiterConfig.windowMs,
  rateLimiterConfig.max,
  'Too many requests from this IP, please try again later'
);

module.exports = rateLimiter;