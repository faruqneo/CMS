const Password = require('../model/password')
const Role = require('../model/role')

//Load password list
exports.passwordList = (req, res) => {
    Password.find({},function(err, password){
        if(err)
        {
            console.log(err)
        }
        else{
            res.render('passwords', {
                password
            });
        }
    });
}

exports.addPassword = (req, res) => {
    Role.find({},function(err, roles){
        res.render('add_passwords', {
            roles
        })
    });
}

//adding new passwords
exports.addNew = (req, res) => {
    req.checkBody('website', 'Website is required').notEmpty();
    req.checkBody('login', 'Login is required').notEmpty();
    req.checkBody('role', 'Role is required').notEmpty();
    req.checkBody('username', 'username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();

    let errors = req.validationErrors();

    if(errors)
    {
        Role.find({},function(err, roles){
            res.render('add_passwords',{
                errors,
                roles
            })      
        });  
    }
    else
    {
        let password = new Password();
        password.website = req.body.name;
        password.login = req.body.email;
        password.role = req.body.role;
        password.username = req.body.password;
        password.password = req.body.password;
        res.json(password)
        // password.save(function(err){
        //     if(err)
        //     {
        //         console.log(err)
        //     }
        //     else
        //     {
        //         req.flash('success_msg', 'Password Added')
        //         res.redirect('/cms/dashboard/passwords')
        //     }
        // });
    }
}