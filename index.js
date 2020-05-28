const express = require('express');
const passport = require('passport');
const LineStrategy = require('./lib').Strategy;
const jwt = require('jsonwebtoken');

const app = express();

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'pug');

passport.use(new LineStrategy({
  channelID: '1654282620',
  channelSecret: '40c88f58a7995b908d03ebaf7285e944',
  callbackURL: 'http://localhost:3000/auth/line/callback',
  scope: ['profile', 'openid', 'email'],
  botPrompt: 'normal'
},
  function (accessToken, refreshToken, params, profile, cb) {
    const { email } = jwt.decode(params.id_token);
    profile.email = email;
    return cb(null, profile);
  }));

// Configure Passport authenticated session persistence.
passport.serializeUser(function(user, cb) {cb(null, user);});
passport.deserializeUser(function(obj, cb) {cb(null, obj);});

// Use application-level middleware for common functionality, including
// parsing, and session handling.
app.use(require('body-parser').urlencoded({extended: true}));
app.use(require('express-session')({secret: 'keyboard dog', resave: true, saveUninitialized: true}));

// Initialize Passport and restore authentication state, if any, from the session.
app.use(passport.initialize());
app.use(passport.session());

// Define routes.
app.get('/', function (req, res) {
  res.render('index', { user: req.user });
});


app.get('/login/line', passport.authenticate('line'));

app.get('/auth/line/callback',
  passport.authenticate('line', {failureRedirect: '/'}),
  function(req, res) {
    res.redirect('/');
  });


app.listen(3000, () => console.log('Example app listening on http://localhost:3000!'))