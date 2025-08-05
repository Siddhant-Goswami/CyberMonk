# Twitter Posting Server Implementation Plan

## Project Overview
Build a simple Node.js server that can post tweets on behalf of a user to X (Twitter) with proper exception handling and rate limiting to stay within free/basic tier limits.

## Research Findings Summary
- **Free Tier Limits**: 1,500 posts/month, very restrictive for most use cases
- **Basic Tier**: $100/month, 50,000 posts/month - more practical for development
- **Recommended Library**: `twitter-api-v2` - most mature and well-maintained
- **Authentication**: OAuth 2.0 with PKCE preferred, OAuth 1.0a still supported
- **Rate Limiting**: Critical to implement with exponential backoff

## Implementation Strategy (MVP Approach)

### Phase 1: Basic Server Setup
**Goal**: Get a working Express server with basic tweet posting capability

**Tasks**:
1. Initialize Node.js project with package.json
2. Install core dependencies:
   - `express` - Web server framework
   - `twitter-api-v2` - Twitter API client
   - `dotenv` - Environment variable management
   - `helmet` - Security middleware
   - `cors` - Cross-origin resource sharing
3. Create basic server structure with Express
4. Set up environment variable configuration
5. Create basic health check endpoint

**Reasoning**: Start with minimal viable setup to validate Twitter API integration before adding complexity.

### Phase 2: Twitter API Integration
**Goal**: Implement tweet posting functionality with proper authentication

**Tasks**:
1. Set up Twitter API credentials (API Key, Secret, Access Token, Access Secret)
2. Initialize TwitterApi client with OAuth 1.0a (simpler for initial implementation)
3. Create POST `/tweet` endpoint
4. Implement basic tweet posting function
5. Add request validation (tweet length, content sanitization)
6. Test with simple text tweets

**Reasoning**: OAuth 1.0a is simpler to implement initially and doesn't require user flow for app-level posting. Can upgrade to OAuth 2.0 later if user-specific posting is needed.

### Phase 3: Exception Handling
**Goal**: Robust error handling for all failure scenarios

**Tasks**:
1. Create centralized error handling middleware
2. Implement specific error handlers for:
   - Twitter API authentication errors (401)
   - Rate limit errors (429) 
   - Invalid request errors (400)
   - Network/connectivity errors
   - Server errors (500)
3. Add structured logging with different log levels
4. Create error response formatting
5. Add request/response logging middleware

**Reasoning**: Proper error handling is critical for production reliability and debugging issues.

### Phase 4: Rate Limiting Implementation
**Goal**: Prevent API rate limit violations with intelligent request management

**Tasks**:
1. Install rate limiting dependencies:
   - `express-rate-limit` - Request rate limiting
   - `node-cache` - In-memory caching for rate limit tracking
2. Implement multi-tier rate limiting:
   - Server-level rate limiting (protect our API)
   - Twitter API rate limiting (respect Twitter limits)
3. Create rate limit configuration based on tier:
   - Free tier: ~50 requests/day (1,500/month)
   - Basic tier: ~1,600 requests/day (50,000/month)
4. Add rate limit status endpoint
5. Implement exponential backoff for Twitter API calls
6. Add queue system for managing tweet posting requests

**Reasoning**: Rate limiting is essential to avoid hitting Twitter API limits and getting temporarily banned.

### Phase 5: Testing & Documentation
**Goal**: Ensure reliability and provide clear usage instructions

**Tasks**:
1. Create comprehensive test suite:
   - Unit tests for core functions
   - Integration tests for API endpoints
   - Mock Twitter API responses for testing
2. Add API documentation (OpenAPI/Swagger)
3. Create README with setup instructions
4. Add example environment file
5. Test error scenarios and rate limiting behavior

**Reasoning**: Testing ensures reliability, documentation enables easy setup and usage.

## Technical Architecture

### Server Structure
```
twitter-api-test/
├── src/
│   ├── controllers/
│   │   └── tweetController.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── validator.js
│   ├── services/
│   │   ├── twitterService.js
│   │   └── rateLimitService.js
│   ├── utils/
│   │   └── logger.js
│   └── app.js
├── tests/
├── .env.example
├── package.json
└── README.md
```

### API Endpoints
- `GET /health` - Health check
- `POST /tweet` - Post a tweet
- `GET /rate-limit-status` - Check current rate limit status

### Environment Variables
```
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET_KEY=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret
TWITTER_TIER=free|basic|pro
PORT=3000
NODE_ENV=development|production
```

### Rate Limiting Strategy
1. **Server Rate Limiting**: Protect our API from abuse
   - 10 requests per minute per IP
   - 100 requests per hour per IP
2. **Twitter API Rate Limiting**: Stay within Twitter limits
   - Track requests per time window
   - Implement exponential backoff (1s, 2s, 4s, 8s)
   - Queue requests when approaching limits

### Error Handling Strategy
1. **Structured Error Responses**:
   ```json
   {
     "error": {
       "code": "RATE_LIMIT_EXCEEDED",
       "message": "Twitter API rate limit exceeded",
       "retryAfter": 900,
       "details": {}
     }
   }
   ```

2. **Error Categories**:
   - `AUTHENTICATION_ERROR` - Invalid credentials
   - `RATE_LIMIT_EXCEEDED` - Hit rate limits
   - `INVALID_REQUEST` - Bad request parameters
   - `TWITTER_API_ERROR` - Twitter API errors
   - `INTERNAL_ERROR` - Server errors

## Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "twitter-api-v2": "^1.24.0",
    "dotenv": "^16.3.1",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.1.5",
    "node-cache": "^5.1.2",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "nodemon": "^3.0.2"
  }
}
```

## Success Criteria
1. Server successfully posts tweets to Twitter
2. Proper error handling for all failure scenarios
3. Rate limiting prevents API violations
4. Comprehensive logging for debugging
5. Clear documentation and setup instructions
6. Test coverage > 80%

## Risk Mitigation
1. **API Changes**: Use official library that handles API updates
2. **Rate Limits**: Conservative rate limiting with buffer
3. **Authentication**: Secure credential storage and rotation
4. **Errors**: Comprehensive error handling and logging
5. **Testing**: Mock API responses to avoid hitting real API during tests

## Timeline Estimate
- Phase 1: 2-3 hours
- Phase 2: 3-4 hours  
- Phase 3: 2-3 hours
- Phase 4: 4-5 hours
- Phase 5: 2-3 hours
- **Total**: 13-18 hours

## Next Steps
1. Set up Twitter Developer Account and get API credentials
2. Initialize project structure
3. Begin Phase 1 implementation
4. Test with Twitter API in development environment