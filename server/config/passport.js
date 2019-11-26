var LocalStrategy    = require('passport-local').Strategy;
var User = require('../models/users');

module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('local-login', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, email, password, done) { //verifica se o usuario existe no login, se existe verifica se a senha esta correta
        if (email)
        email = email.toLowerCase();
        process.nextTick(function() {
            User.findOne({ 'local.email' :  email }, function(err, user) {
                if (err)
                return done(err);
                if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found'));
                if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Wrong password'));
                else
                return done(null, user);
            });
        });
    }));

    passport.use('local-signup', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, email, password, done) { //verifica unicidade de email no registro
        if (email)
        email = email.toLowerCase();
        process.nextTick(function() {
            if (!req.user) {
                User.findOne({ 'local.email' :  email }, function(err, user) {
                    if (err)
                    return done(err);
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'This user already exists.'));
                    } else {
                        // cria usuario
                        var newUser = new User();
                        // pega o nome pelo req.body
                        newUser.local.name = req.body.name;
                        newUser.local.email = email;
                        newUser.local.password = newUser.generateHash(password);
                        // salva usuario
                        newUser.save(function(err) {
                            if (err)
                            throw err;
                            return done(null, newUser);
                        });
                    }
                });
            } else {
                return done(null, req.user);
            }
        });
    }));
};
