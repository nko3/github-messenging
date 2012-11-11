var couch_url = process.env['COUCH_URL'] || ('http://localhost:5984')
  , nano = require('nano')(couch_url)
  , couch = nano.db.use('github-messaging')
  , request = require('request')
  , util = require('util')
  ;

function Db() {
  this.userDocname = 'user-%s';
  this.followingDocname = 'user-%s-following';
  this.followingUrl = 'https://api.github.com/users/%s/following';
  this.profileUrl = 'https://api.github.com/users/%s';
}

Db.prototype.findUserOrCreate = function(profile, done) {

  var that = this
    , docname = util.format(that.userDocname, profile.id)
    ;

  couch.get(docname, function(error, doc) {
    if (error) {
      couch.insert({'profile': that.getUserFromProfile(profile)}, docname, function(error, doc) {
        if (error) {
          return done(error);
        }
        process.nextTick(function() {
          that.addFollowing(profile, done);
        });
      })
    } else {
      done(null, doc);
    }
  })
}

Db.prototype.addFollowing = function(profile, done) {

  var that = this
    , url = util.format(that.followingUrl, profile.username)
    , docname = util.format(that.followingDocname, profile.id)
    ;

  request(url, function (error, response, body) {
    if (error || response.statusCode != 200) {
      done(error);
    }
    var following = JSON.stringify(body);
    couch.insert({'following': following}, docname, function(error, doc) {
      if (error) {
        return done(error);
      }
      done(null, doc);
    });
  })
}

Db.prototype.getFollowing = function(id, cb) {

  var docname = util.format(this.followingDocname, id)
    ;

  couch.get(docname, function(error, doc) {
    if (error) {
      return cb(error);
    }
    return cb(null, doc);
  });
}

// If we have the details about the user, return that.
// Else get the details from github, save and return the result
Db.prototype.findUserOrRetrieve = function(githubId, githubLogin, cb) {
  var docname = util.format(this.userDocname, githubId)
    , that = this
    ;

  couch.get(docname, function(error, doc) {
    if (error) {
      var url = util.format(that.profileUrl, githubLogin);
      request(url, function (error, response, body) {
        if (error || response.statusCode != 200) {
          return cb(error);
        }
        couch.insert({'profile': that.getUserFromProfile(body)}, docname, function(error, doc) {
          return cb(error, doc);
        });
      })
    } else {
      return cb(null, doc);
    }
  });
}

// Get a user object that we will store in couch
// from a passport github profile object
Db.prototype.getUserFromProfile = function(profile) {
  var u = {
    'github_id': profile.id
    , 'display_name': profile.displayName
    , 'username': profile.username
    , 'profile_url': profile.profileUrl
    , 'emails': profile.emails
  }

  if (profile._json) {
    u['public_repos'] = profile._json.public_repos
    u['company'] = profile._json.company
    u['followers'] = profile._json.followers
    u['avatar_url'] = profile._json.avatar_url
    u['bio'] = profile._json.bio
    u['following'] = profile._json.following
    u['email'] = profile._json.email
    u['login'] = profile._json.login
  } else {
    u['public_repos'] = profile.public_repos
    u['company'] = profile.company
    u['followers'] = profile.followers
    u['avatar_url'] = profile.avatar_url
    u['bio'] = profile.bio
    u['following'] = profile.following
    u['email'] = profile.email
    u['login'] = profile.login
  }

  return u;
}

exports = module.exports = new Db();
exports.version = '0.0.1';
exports.Db = Db;
