var express = require('express')
    , login = require('./login.js')
    , request = require('request');

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
  res.render('messages', { user: req.user });
});

app.get('/friend/add', login.ensureAuthenticated, function(req, res){
  var friendName =  req.query['friend_name'];
  request('https://api.github.com/users/'+friendName, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      // Store usr
      res.send(JSON.stringify({ 'status': 'ok', 'profile': JSON.stringify(body) }));
    } else {
      res.send(JSON.stringify({ 'status': 'error' }));
    }
  })
});

app.get('*', function(req, res){
  res.status(404);
  res.render('404');
});

// Be sure to change the github id and secret if you change the port
app.listen(3000)
console.info("Started on port 3000");
