# Twitter API Posting Server

A robust Node.js REST API server for posting tweets to X (Twitter) with comprehensive rate limiting and error handling to stay within API tier limits.

## ✨ Features

- **Tweet Posting**: Post tweets via REST API with validation and sanitization
- **Rate Limiting**: Multi-tier rate limiting (minute/hour/day/month) to prevent API violations
- **Error Handling**: Comprehensive error handling with structured responses
- **Security**: Helmet.js security headers, CORS support, input validation
- **Monitoring**: Winston logging with different log levels
- **Account Info**: Get authenticated user's account information
- **Health Checks**: Server health monitoring endpoint

## 🚀 Quick Start

### Prerequisites

- Node.js 14+ 
- Twitter Developer Account with API access
- Twitter API credentials (API Key, Secret, Access Token, Access Secret)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Siddhant-Goswami/CyberMonk.git
cd CyberMonk
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your Twitter API credentials:
```env
TWITTER_API_KEY=your_api_key_here
TWITTER_API_SECRET_KEY=your_api_secret_key_here
TWITTER_ACCESS_TOKEN=your_access_token_here
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret_here
TWITTER_TIER=basic
PORT=3000
NODE_ENV=development
```

4. **Start the server**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## 📡 API Endpoints

### Health Check
```http
GET /health
```
Returns server health status and uptime.

### Post Tweet
```http
POST /api/tweet
Content-Type: application/json

{
  "text": "Your tweet content here"
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Tweet posted successfully",
  "data": {
    "id": "1234567890123456789",
    "text": "Your tweet content here",
    "created_at": "2025-08-05T12:00:00.000Z"
  }
}
```

**Validation Errors (400)**:
```json
{
  "error": {
    "code": "TEXT_TOO_LONG",
    "message": "Tweet text exceeds 280 character limit",
    "details": {
      "currentLength": 285,
      "maxLength": 280
    }
  }
}
```

### Rate Limit Status
```http
GET /api/rate-limit-status
```

Returns current rate limit usage across all time windows:
```json
{
  "success": true,
  "data": {
    "tier": "basic",
    "limits": {
      "minute": {
        "current": 0,
        "limit": 1,
        "remaining": 1,
        "resetTime": "2025-08-05T13:02:00.000Z"
      },
      "hour": {
        "current": 5,
        "limit": 69,
        "remaining": 64,
        "resetTime": "2025-08-05T13:30:00.000Z"
      }
    }
  }
}
```

### Account Information
```http
GET /api/account
```

Returns authenticated user's Twitter account information:
```json
{
  "success": true,
  "data": {
    "id": "1952688688632406016",
    "username": "your_username",
    "name": "Your Display Name"
  }
}
```

## 🛡️ Rate Limiting

The server implements intelligent rate limiting based on your Twitter API tier:

### Free Tier
- **Monthly**: 1,500 posts
- **Daily**: ~50 posts  
- **Hourly**: ~2 posts
- **Per Minute**: 1 post

### Basic Tier ($100/month)
- **Monthly**: 50,000 posts
- **Daily**: ~1,667 posts
- **Hourly**: ~69 posts  
- **Per Minute**: 1 post

### Pro Tier ($5,000/month)
- **Monthly**: 1,000,000 posts
- **Daily**: ~33,333 posts
- **Hourly**: ~1,388 posts
- **Per Minute**: 23 posts

Rate limits are enforced at the server level to prevent hitting Twitter API limits and getting temporarily banned.

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `TWITTER_API_KEY` | Twitter API Key | - | Yes |
| `TWITTER_API_SECRET_KEY` | Twitter API Secret Key | - | Yes |
| `TWITTER_ACCESS_TOKEN` | Twitter Access Token | - | Yes |
| `TWITTER_ACCESS_TOKEN_SECRET` | Twitter Access Token Secret | - | Yes |
| `TWITTER_TIER` | API tier (free/basic/pro) | `basic` | No |
| `PORT` | Server port | `3000` | No |
| `NODE_ENV` | Environment | `development` | No |
| `LOG_LEVEL` | Log level | `info` | No |

## 🧪 Testing

### Run API Tests
```bash
# Test all endpoints without posting actual tweets
node test_api.js

# Test actual tweet posting (requires valid credentials)
node test_tweet_posting.js
```

### Run Unit Tests
```bash
npm test
npm run test:watch  # Watch mode
```

## 📊 Error Handling

The API returns structured error responses:

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `MISSING_TEXT` | 400 | Tweet text is required |
| `TEXT_TOO_LONG` | 400 | Tweet exceeds 280 characters |
| `RATE_LIMIT_EXCEEDED` | 429 | Rate limit exceeded |
| `AUTHENTICATION_ERROR` | 401 | Invalid Twitter credentials |
| `TWITTER_API_ERROR` | Various | Twitter API specific errors |
| `INTERNAL_ERROR` | 500 | Server errors |

## 📁 Project Structure

```
twitter-api-test/
├── src/
│   ├── controllers/
│   │   └── tweetController.js      # Tweet posting logic
│   ├── middleware/
│   │   ├── errorHandler.js         # Global error handling
│   │   ├── rateLimiter.js          # Server rate limiting
│   │   └── validator.js            # Input validation
│   ├── routes/
│   │   └── tweets.js               # API routes
│   ├── services/
│   │   ├── twitterService.js       # Twitter API integration
│   │   └── rateLimitService.js     # Rate limit tracking
│   ├── utils/
│   │   └── logger.js               # Winston logging
│   └── app.js                      # Express app setup
├── logs/                           # Log files
├── .env.example                    # Environment template
├── .gitignore                      # Git ignore rules
├── package.json                    # Dependencies
└── README.md                       # This file
```

## 🔒 Security Features

- **Helmet.js**: Security headers protection
- **CORS**: Cross-origin resource sharing
- **Input Validation**: Tweet content validation and sanitization
- **Rate Limiting**: Prevents abuse and API violations
- **Error Handling**: No sensitive information in error responses
- **Credential Management**: Environment-based credential storage

## 🚨 Important Security Notes

- ⚠️ **Never commit API credentials to version control**
- 🔄 **Rotate credentials if accidentally exposed**
- 🔒 **Use environment variables for all sensitive data**
- 📊 **Monitor API usage and rate limits**
- 🛡️ **Keep dependencies updated for security patches**

## 📈 Monitoring & Logging

- **Winston Logger**: Structured logging with multiple levels
- **Request Logging**: All API requests logged with metadata
- **Error Tracking**: Comprehensive error logging with stack traces
- **Rate Limit Monitoring**: Track usage patterns and approaching limits

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

ISC License - see LICENSE file for details.

## 🆘 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/Siddhant-Goswami/CyberMonk/issues)
- **Twitter API Docs**: [Official Twitter API Documentation](https://developer.twitter.com/en/docs)

---

**Happy Tweeting! 🐦✨**