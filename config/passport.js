const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const User = require('../model/user')

module.exports = function(passport){
    passport.use(new LocalStrategy(
        function(username, password, done) {
            User.findOne({ username: username }, function (err, user) {
            //  console.log('local')
            if (err) throw err;
            if (!user) { return done(null, false, {message: 'No user found'}); }
            
            //Match Password
            bcrypt.compare(password, user.password, function(err, isMatch){
             // console.log('password')
                if(err) throw err;
                if(isMatch){ return done(null, user)}
                else{return done(null,false, {message: 'worng password'});}
            })
          });
        }
      ));


    passport.serializeUser(function(user, done) {
    //  console.log('serializeUser'+user.id)
      done(null, user.id);
    });
    
    passport.deserializeUser(function(id, done) {
    //  console.log('deserializeUser'+id)
      User.findById(id, function(err, user) {
        done(err, user);
      });
    });

}