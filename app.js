require("dotenv").config();

var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require("cors");

//instancia multer
var multer = require('multer');
//salva o video em pasta local, limita o tamanho maximo de video aceito, limita a quantidade de uploads pra 1
var upload = multer({ dest:'./public/uploads/', limits: {fileSize: 1000000000000, files:1} });

var index = require('./server/controllers/index');
var auth = require('./server/controllers/auth');
var videos = require('./server/controllers/videos');

var mongoose = require('mongoose');

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var passport = require('passport');
var flash = require('connect-flash');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'server/views/pages'));
app.set('view engine', 'ejs');

//configuração banco    
var config = require('./server/config/config.js');
mongoose.connect(config.url), {useNewUrlParser: true};
mongoose.connection.on('error', function() {
	console.error('MongoDB error');
});

//configuracao passport
require('./server/config/passport')(passport);

app.use(cors());
app.use(express.json());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('node-sass-middleware')({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true,
    sourceMap: true
}));

app.use(express.static(path.join(__dirname, 'public')));

//sessao salva no banco
app.use(session({
    secret: 'sometextgohere',
    saveUninitialized: true,
    resave: true,
    store: new MongoStore({
        url: config.url,
        collection : 'sessions'
    })
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//rotas de usuario
app.get('/', index.show);
app.get('/login', auth.signin);
app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile',
    failureRedirect : '/login',
    failureFlash : true
}));
app.get('/signup', auth.signup);
app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/profile',
    failureRedirect : '/signup',
    failureFlash : true
})); 

app.get('/profile', auth.isLoggedIn, auth.profile);

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
}); 

//rotas dos videos
app.get('/videos', videos.hasAuthorization, videos.listVideos);
app.post('/videos', videos.hasAuthorization, upload.single('video'), videos.uploadVideo);
app.get('/videos/buscar', videos.hasAuthorization, videos.findVideo);

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;

//definicao de porta
app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port);
});
