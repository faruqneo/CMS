const passport = require('passport')

exports.login = (req, res, next) => {
        console.log("login")
        passport.authenticate('local',{
        successRedirect: '/cms/dashboard/1',
        failureRedirect: '/cms',
        failureFlash: 'true',
    })(req, res, next);
};

exports.logout = (req, res) => {
    console.log("logout")
    req.logout();
	res.redirect(`/cms`);
};

exports.ensureAthenticated = (req, res, next) => {
     if(req.isAuthenticated()){
        return next();
    }
    return res.redirect('/cms')

}

exports.ensurePermission = (req, res, next) => {
    // console.log(permitted)
    if(!global.permitted){
        req.isPermitted = true;
       return next();
   }
   else {
    req.isPermitted = false;
    return next({msg: "UnAuthenticated"})
   }
   

}