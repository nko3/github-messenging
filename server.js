var express = require('express')
    , login = require('./login.js')
    , request = require('request')
    , db = require('./db.js')
    , async = require('async')
    ;

var app = module.exports = express();
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'htuayreve'}));
  app.use(login.passport.initialize());
  app.use(login.passport.session());
  app.use('/static', express.static(__dirname + '/static'));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

app.get('/', function(req, res, next) {
  res.render('index');
});

app.get('/login', function(req, res){
  res.redirect('/auth/github');
});

app.get('/unauthorized', function(req, res){
  res.render('401');
});

app.get('/auth/github',
  login.passport.authenticate('github'),
  function(req, res){
  }
);

app.get('/auth/github/callback', 
  login.passport.authenticate('github', {
    successRedirect: '/messages',
    failureRedirect: '/unauthorized',
    failureFlash: true
  })
);

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/messages', login.ensureAuthenticated, function(req, res){
  var user = req.user
    ;
    
  if (user.profile === undefined || user.profile.github_id === undefined) {
    res.redirect('/logout');
  }

  async.parallel({
    following: function(cb) {
      db.getFollowing(user.profile.github_id, cb);
    }
  }, function(error, results) {
    // duh!?  Looks like we need to call json parse twice
    var f = JSON.parse(results.following.following);
    user.following = JSON.parse(f);
    res.render('messages', { user: user });
  });
});

// TODO: login.ensureAuthenticaated
app.get('/message/add', function(req, res){
  var toName = req.query['to_name']
    , toId = req.query['to_id']
    , message = req.query['message']
    , user = req.user
    ;
  
  if (user === undefined) {
    var out = JSON.stringify ({ status: 'error', message: 'You are not logged in' })
      ;
    res.writeHead(200, {"Content-Type": "application/json"});
    res.write(out);
  }

  async.series({
    toUser: function(cb) {
      db.findUserOrRetrieve(toId, toName, cb);
    }
  }, function(error, results) {
    async.parallel({
      sentMessage: function(cb) {
        db.saveMessage(user, results.toUser, message, cb);
      },
      ignore: function(cb) {
        db.addFollowing(results.toUser.profile, cb);
      }
    }, function(error, dummy) {
      res.writeHead(200, {"Content-Type": "application/json"});  
      res.write( JSON.stringify ({
        'status': 'ok', 'message': results.sentMessage
      }));
    });
  });

});

app.get('*', function(req, res){
  res.status(404);
  res.render('404');
});

// Be sure to change the github id and secret if you change the port
app.listen(3000)
console.info("Started on port 3000");
