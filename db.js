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
}

Db.prototype.findUserByName = function(username) {
}

Db.prototype.findUserByEmail = function(email) {
}

Db.prototype.findUserOrCreate = function(profile, done) {

  var that = this
    , docname = util.format(that.userDocname, profile.id)
    ;

  couch.get(docname, function(error, doc) {
    if (error) {
      couch.insert({'profile': that.getUserFromProfile(profile)}, docname, function(error, doc) {
        if (error) {
          return done('error', profile, 'Error saving profile');
        }
        process.nextTick(function() {
          that.addFollowing(doc, done, profile);
        });
      })
    } else {
      done(null, doc);
    }
  })
}

Db.prototype.addFollowing = function(user, done, profile) {

  var that = this
    , url = util.format(that.followingUrl, profile.username)
    , docname = util.format(that.followingDocname, profile.id)
    ;

  request(url, function (error, response, body) {
    if (error || response.statusCode != 200) {
      done(error, profile, 'Unable to get following');
    }
    var following = JSON.stringify(body);
    couch.insert({'following': following}, docname, function(error, doc) {
      if (error) {
        return done('error', profile, 'Error saving following');
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
      return cb('error', doc, 'Unable to get following from DB');
    }
    return cb(null, doc);
  });
}

// Get a user object that we will store in couch
// from a passport github profile object
Db.prototype.getUserFromProfile = function(profile) {
  return {
    'github_id': profile.id
    , 'display_name': profile.displayName
    , 'username': profile.username
    , 'profile_url': profile.profileUrl
    , 'emails': profile.emails
    , 'public_repos': profile._json.public_repos
    , 'company': profile._json.company
    , 'followers': profile._json.followers
    , 'avatar_url': profile._json.avatar_url
    , 'bio': profile._json.bio
    , 'following': profile._json.following
    , 'email': profile._json.email
    , 'login': profile._json.login
  }
}

exports = module.exports = new Db();
exports.version = '0.0.1';
exports.Db = Db;
