const { TwitterApi } = require('twitter-api-v2');
const logger = require('../utils/logger');

class TwitterService {
  constructor() {
    this.client = null;
    this.initializeClient();
  }

  initializeClient() {
    try {
      const requiredEnvVars = [
        'TWITTER_API_KEY',
        'TWITTER_API_SECRET_KEY',
        'TWITTER_ACCESS_TOKEN',
        'TWITTER_ACCESS_TOKEN_SECRET'
      ];

      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
      }

      this.client = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY,
        appSecret: process.env.TWITTER_API_SECRET_KEY,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
      });

      logger.info('Twitter API client initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Twitter API client:', error);
      throw error;
    }
  }

  async postTweet(text) {
    try {
      if (!this.client) {
        throw new Error('Twitter API client not initialized');
      }

      if (!text || typeof text !== 'string') {
        throw new Error('Tweet text is required and must be a string');
      }

      if (text.length > 280) {
        throw new Error('Tweet text exceeds 280 character limit');
      }

      if (text.trim().length === 0) {
        throw new Error('Tweet text cannot be empty');
      }

      logger.info('Attempting to post tweet', { 
        textLength: text.length,
        preview: text.substring(0, 50) + (text.length > 50 ? '...' : '')
      });

      const response = await this.client.v2.tweet(text);

      logger.info('Tweet posted successfully', {
        tweetId: response.data.id,
        text: response.data.text
      });

      return {
        success: true,
        data: {
          id: response.data.id,
          text: response.data.text,
          created_at: new Date().toISOString()
        }
      };

    } catch (error) {
      logger.error('Error posting tweet:', {
        error: error.message,
        code: error.code,
        data: error.data
      });

      if (error.code === 429) {
        throw {
          code: 429,
          message: 'Twitter API rate limit exceeded',
          retryAfter: error.rateLimit?.reset || 900,
          details: error.data
        };
      }

      if (error.code === 401) {
        throw {
          code: 401,
          message: 'Twitter API authentication failed',
          details: error.data
        };
      }

      if (error.code === 400) {
        throw {
          code: 400,
          message: error.message || 'Invalid tweet content',
          details: error.data
        };
      }

      throw {
        code: 500,
        message: error.message || 'Failed to post tweet',
        details: error.data || {}
      };
    }
  }

  async getAccountInfo() {
    try {
      if (!this.client) {
        throw new Error('Twitter API client not initialized');
      }

      const response = await this.client.v2.me();
      
      return {
        success: true,
        data: {
          id: response.data.id,
          username: response.data.username,
          name: response.data.name
        }
      };

    } catch (error) {
      logger.error('Error getting account info:', error);
      throw {
        code: error.code || 500,
        message: error.message || 'Failed to get account information',
        details: error.data || {}
      };
    }
  }
}

module.exports = new TwitterService();