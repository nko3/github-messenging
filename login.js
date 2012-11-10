var express = require('express')
  , passport = require('passport')
  , util = require('util')
  , GitHubStrategy = require('passport-github').Strategy;

var CLIENT_ID = process.env['GITHUB_CLIENT_ID'] || '7431e9e62b002407bded' // dev id
  , CLIENT_SECRET = process.env['GITHUB_CLIENT_SECRET'] || '26b631364ffc0d32fc03c999bb49bca1d07940d1' // dev secret
  , CALLBACK_URL = process.env['GITHUB_CALLBACK_URL'] || 'http://127.0.0.1:3000/auth/github/callback';

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new GitHubStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      return done(null, profile);
    });
  }
));

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/auth/github')
}

module.exports = {
  'ensureAuthenticated': ensureAuthenticated,
  'passport': passport
};
