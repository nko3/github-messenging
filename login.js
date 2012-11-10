var express = require('express')
  , passport = require('passport')
  , util = require('util')
  , GitHubStrategy = require('passport-github').Strategy;

var GITHUB_CLIENT_ID = process.env['github_client_id'] || '7431e9e62b002407bded'; // dev id
var GITHUB_CLIENT_SECRET = process.env['github_client_secret'] || '26b631364ffc0d32fc03c999bb49bca1d07940d1'; // dev secret

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/github/callback"
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
