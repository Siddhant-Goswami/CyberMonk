const logger = require('../utils/logger');

const validateTweetText = (req, res, next) => {
  const { text } = req.body;

  const errors = [];

  if (!text) {
    errors.push('Tweet text is required');
  } else {
    if (typeof text !== 'string') {
      errors.push('Tweet text must be a string');
    } else {
      if (text.trim().length === 0) {
        errors.push('Tweet text cannot be empty');
      }
      
      if (text.length > 280) {
        errors.push(`Tweet text exceeds 280 character limit (current: ${text.length})`);
      }

      if (text.length < 1) {
        errors.push('Tweet text must be at least 1 character long');
      }
    }
  }

  if (errors.length > 0) {
    logger.warn('Tweet validation failed', {
      errors,
      textLength: text ? text.length : 0,
      ip: req.ip
    });

    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Tweet validation failed',
        details: {
          errors,
          textLength: text ? text.length : 0,
          maxLength: 280
        }
      }
    });
  }

  req.validatedText = text.trim();
  next();
};

const sanitizeInput = (req, res, next) => {
  if (req.body.text) {
    req.body.text = req.body.text.trim();
    
    if (req.body.text.includes('\u0000')) {
      req.body.text = req.body.text.replace(/\u0000/g, '');
    }
  }

  next();
};

module.exports = {
  validateTweetText,
  sanitizeInput
};