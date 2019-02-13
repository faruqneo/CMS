const passport = require(`passport`)

exports.login = passport.authenticate('local',{
    successRedirect: '/cms/dashboard',
    failureRedirect: '/cms',
    failureFlash: 'true'
});

exports.logout = (req, res) => {
    req.logout();
//	console.log(`Logged out`);
	req.flash(`success`, `Successfully logged out`);
//	console.log(`Flashes sent`);
	res.redirect(`/cms`);
//	console.log(`Redirected`);
};

exports.ensureAthenticated = (req, res, next) => {
     if(req.isAuthenticated){
        console.log('ensure')
        return next();
    }
    else
    {
        console.log('not ensure')
        res.redirect('/cms')
    }
}