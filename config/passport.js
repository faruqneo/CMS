const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const User = require('../model/user')
const Switch1 = require('../model/switch')

module.exports = function(passport){
    passport.use(new LocalStrategy(
        async function(username, password, done) {
          try {
            let user = await User.findOne({ username: username }).lean();
            if (!user) { return done(null, false, {message: 'No user found'}); }

           let check = await Switch1.find({}).sort({"_id":-1});
            //console.log(check[0].status)
            user.permitted = check[0].status;
            global.permitted = user.permitted;
            // global.permitted = false;
            bcrypt.compare(password, user.password, function(err, isMatch){
             // console.log('password')
                if(err) throw err;
                if(isMatch){ 
                  
                  return done(null, user)
                }
                else{
                  return done(null,false, {message: 'worng password'});
                }
            })
          } catch (error) {
            throw error;
          }

          //   User.findOne({ username: username }, function (err, user) {
          //   //   let buttonValue
          //   // Switch1.find({}).sort({"_id":-1}).exec()
          //   // .then(res => {buttonValue = res[0].status})
          //   // .catch(error => console.log(error))
            
            
          //   if (err) throw err;
          //   if (!user) { return done(null, false, {message: 'No user found'}); }
            
          //   //Match Password
          //   bcrypt.compare(password, user.password, function(err, isMatch){
          //    // console.log('password')
          //       if(err) throw err;
          //       if(isMatch){ 
                  
          //         return done(null, user)
          //       }
          //       else{return done(null,false, {message: 'worng password'});}
          //   })
          // });
        }
      ));


    passport.serializeUser(function(user, done) {
     // console.log({user})
      done(null, {id:user._id, permitted: user.permitted});
    });
    
    passport.deserializeUser(async function(uobj, done) {
      //console.log(done)
      let {id, permitted} = uobj;
      try {
        let user = await User.findById(id).lean();
        user.permitted = permitted;
        
        done(null, user);
      } catch (error) {
        done(error, null);
      }
      // User.findById(id, function(err, user) {
      //   done(err, user);
      // });
    });

}