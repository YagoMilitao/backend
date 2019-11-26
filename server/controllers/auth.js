var passport = require('passport');

exports.signin = function(req, res) {
    res.render('login', { title: 'Login Page', message: req.flash('loginMessage') });
};

exports.signup = function(req, res) {
    res.render('signup', { title: 'Signup Page', message: req.flash('signupMessage') });

};

exports.profile = function(req, res) {
    res.render('profile', { title: 'Profile Page', user : req.user});
};

exports.logout = function () {
    req.logout();
    res.redirect('/');
};

exports.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
};
