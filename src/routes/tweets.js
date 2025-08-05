const express = require('express');
const router = express.Router();

const tweetController = require('../controllers/tweetController');
const { validateTweetText, sanitizeInput } = require('../middleware/validator');

router.post('/tweet', sanitizeInput, validateTweetText, tweetController.postTweet);

router.get('/rate-limit-status', tweetController.getRateLimitStatus);

router.get('/account', tweetController.getAccountInfo);

module.exports = router;