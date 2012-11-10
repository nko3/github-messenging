var express = require('express')
    , passport = require('passport')
    , util = require('util')
    , GitHubStrategy = require('passport-github').Strategy;

var app = module.exports = express();
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'htuayreve'}));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);

  app.use(express.static(__dirname + '/static'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

app.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Welcome to github-messenging'
  });
});

app.listen(3000)
console.info("Started on port 3000");
