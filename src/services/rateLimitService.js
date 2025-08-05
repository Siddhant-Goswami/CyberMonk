const NodeCache = require('node-cache');
const logger = require('../utils/logger');

class RateLimitService {
  constructor() {
    this.cache = new NodeCache({ stdTTL: 900 }); // 15 minutes default TTL
    this.twitterLimits = this.getTwitterLimits();
  }

  getTwitterLimits() {
    const tier = process.env.TWITTER_TIER || 'basic';
    
    const limits = {
      free: {
        postsPerMonth: 1500,
        postsPerDay: 50, // ~1500/30
        postsPerHour: 2,  // Conservative estimate
        postsPerMinute: 1
      },
      basic: {
        postsPerMonth: 50000,
        postsPerDay: 1667, // ~50000/30
        postsPerHour: 69,  // ~1667/24
        postsPerMinute: 1
      },
      pro: {
        postsPerMonth: 1000000,
        postsPerDay: 33333, // ~1000000/30
        postsPerHour: 1388, // ~33333/24
        postsPerMinute: 23
      }
    };

    return limits[tier] || limits.basic;
  }

  generateKey(type, timeWindow) {
    const now = new Date();
    let key;

    switch (timeWindow) {
      case 'minute':
        key = `${type}:${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}`;
        break;
      case 'hour':
        key = `${type}:${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;
        break;
      case 'day':
        key = `${type}:${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
        break;
      case 'month':
        key = `${type}:${now.getFullYear()}-${now.getMonth()}`;
        break;
      default:
        key = `${type}:${timeWindow}`;
    }

    return key;
  }

  async checkRateLimit(operation = 'tweet') {
    const checks = [
      { window: 'minute', limit: this.twitterLimits.postsPerMinute, ttl: 60 },
      { window: 'hour', limit: this.twitterLimits.postsPerHour, ttl: 3600 },
      { window: 'day', limit: this.twitterLimits.postsPerDay, ttl: 86400 },
      { window: 'month', limit: this.twitterLimits.postsPerMonth, ttl: 2592000 }
    ];

    for (const check of checks) {
      const key = this.generateKey(operation, check.window);
      const currentCount = this.cache.get(key) || 0;

      if (currentCount >= check.limit) {
        logger.warn('Rate limit exceeded', {
          operation,
          window: check.window,
          currentCount,
          limit: check.limit
        });

        throw {
          code: 429,
          message: `Rate limit exceeded for ${check.window}ly ${operation} operations`,
          retryAfter: check.ttl,
          details: {
            window: check.window,
            limit: check.limit,
            current: currentCount,
            resetTime: new Date(Date.now() + (check.ttl * 1000)).toISOString()
          }
        };
      }
    }

    return true;
  }

  async incrementRateLimit(operation = 'tweet') {
    const increments = [
      { window: 'minute', ttl: 60 },
      { window: 'hour', ttl: 3600 },
      { window: 'day', ttl: 86400 },
      { window: 'month', ttl: 2592000 }
    ];

    for (const increment of increments) {
      const key = this.generateKey(operation, increment.window);
      const currentCount = this.cache.get(key) || 0;
      this.cache.set(key, currentCount + 1, increment.ttl);
    }

    logger.info('Rate limit incremented', { operation });
  }

  async getRateLimitStatus(operation = 'tweet') {
    const windows = ['minute', 'hour', 'day', 'month'];
    const limits = [
      this.twitterLimits.postsPerMinute,
      this.twitterLimits.postsPerHour,
      this.twitterLimits.postsPerDay,
      this.twitterLimits.postsPerMonth
    ];

    const status = {};

    windows.forEach((window, index) => {
      const key = this.generateKey(operation, window);
      const currentCount = this.cache.get(key) || 0;
      const limit = limits[index];

      status[window] = {
        current: currentCount,
        limit: limit,
        remaining: Math.max(0, limit - currentCount),
        resetTime: this.getResetTime(window)
      };
    });

    return status;
  }

  getResetTime(window) {
    const now = new Date();
    let resetTime;

    switch (window) {
      case 'minute':
        resetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + 1, 0, 0);
        break;
      case 'hour':
        resetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0, 0);
        break;
      case 'day':
        resetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
        break;
      case 'month':
        resetTime = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
        break;
      default:
        resetTime = new Date(now.getTime() + 900000); // 15 minutes default
    }

    return resetTime.toISOString();
  }
}

module.exports = new RateLimitService();