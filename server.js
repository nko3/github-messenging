var express = require('express')
    , login = require('./login.js');

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
  app.use(express.static(__dirname + '/static'));
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
  login.passport.authenticate('github', { failureRedirect: '/unauthorized' }),
  function(req, res) {
    res.redirect('/messages');
  }
);

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/messages', login.ensureAuthenticated, function(req, res){
  res.render('messages', { user: req.user });
});

// Be sure to change the github id and secret if you change the port
app.listen(3000)
console.info("Started on port 3000");
