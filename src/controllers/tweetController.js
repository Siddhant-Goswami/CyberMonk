const twitterService = require('../services/twitterService');
const rateLimitService = require('../services/rateLimitService');
const logger = require('../utils/logger');

const postTweet = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        error: {
          code: 'MISSING_TEXT',
          message: 'Tweet text is required',
          details: {}
        }
      });
    }

    if (typeof text !== 'string') {
      return res.status(400).json({
        error: {
          code: 'INVALID_TEXT_TYPE',
          message: 'Tweet text must be a string',
          details: {}
        }
      });
    }

    if (text.trim().length === 0) {
      return res.status(400).json({
        error: {
          code: 'EMPTY_TEXT',
          message: 'Tweet text cannot be empty',
          details: {}
        }
      });
    }

    if (text.length > 280) {
      return res.status(400).json({
        error: {
          code: 'TEXT_TOO_LONG',
          message: 'Tweet text exceeds 280 character limit',
          details: {
            currentLength: text.length,
            maxLength: 280
          }
        }
      });
    }

    await rateLimitService.checkRateLimit('tweet');

    const result = await twitterService.postTweet(text);

    await rateLimitService.incrementRateLimit('tweet');

    logger.info('Tweet posted successfully via API', {
      tweetId: result.data.id,
      textLength: text.length,
      ip: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Tweet posted successfully',
      data: result.data
    });

  } catch (error) {
    next(error);
  }
};

const getRateLimitStatus = async (req, res, next) => {
  try {
    const status = await rateLimitService.getRateLimitStatus('tweet');

    res.status(200).json({
      success: true,
      data: {
        tier: process.env.TWITTER_TIER || 'basic',
        limits: status
      }
    });

  } catch (error) {
    next(error);
  }
};

const getAccountInfo = async (req, res, next) => {
  try {
    const result = await twitterService.getAccountInfo();

    res.status(200).json({
      success: true,
      data: result.data
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  postTweet,
  getRateLimitStatus,
  getAccountInfo
};