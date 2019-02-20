const Password = require('../model/password')
const Role = require('../model/role')
const moment = require('moment');

//Load password list
exports.passwordList = (req, res) => {
    Password.find({},function(err, password){
        if(err)
        {
            console.log(err)
        }
        else{
            //console.log(password)
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
        password.website = req.body.website;
        password.login = req.body.login;
        password.role = req.body.role;
        password.username = req.body.username;
        password.password = req.body.password;
        //res.json(password)
        password.save(function(err){
            if(err)
            {
                console.log(err)
            }
            else
            {
                req.flash('success_msg', 'Password Added')
                res.redirect('/cms/dashboard/passwords/list')
            }
        });
    }
}

//detailes view for password
exports.passwordsView = (req, res) => {
    Password.findById(req.params.id,function(err, passwords){
            res.render('passwordsView', {
                passwords
            });
        })
}

//update for passwords
exports.passwordsUpdate = (req, res) => {
    req.checkBody('website', 'website is required').notEmpty();
    req.checkBody('login', 'login is required').notEmpty();
    req.checkBody('role', 'role is required').notEmpty();
    req.checkBody('username', 'username is required').notEmpty();
    req.checkBody('password', 'password is required').notEmpty();

    let errors = req.validationErrors();
    
    if(errors)
    {
        res.render('passwordsView',{
            errors
        }); 
    }
    else
    {
        let passwords = req.body;
        passwords.updatedAT = moment().format();
        let id = {_id:req.params.id}
        //console.log(req.params.id)
        Password.updateOne(id, passwords,function(err){
            if(err)
            {
                console.log(err)
            }
            else
            {
                req.flash('success', 'Password Update')
                res.redirect('/cms/dashboard/passwords/list')
            }
        })
    }
}

//password delete 
exports.passwordsDelete = (req, res) => {
    let id = {_id:req.params.id}
    Password.deleteOne(id, function(err){
        if(err)
        {
            console.log(err)
        }
        else
        {
            req.flash('success', 'Password Deleted')
            res.redirect('/cms/dashboard/passwords/list')
        }
    })
}

//Passwords list api for bot
exports.passwordSite = (req, res) => {
    Password.find({},function(err, password){
        if(err)
        {
            console.log(err)
        }
        else{
            //console.log(password)
            res.send(password)
        }
    });
}