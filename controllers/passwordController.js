const Password = require('../model/password')
const Role = require('../model/role')
const moment = require('moment');

//Load password list
exports.passwordList = async (req, res) => {
    try {
        let password = await Password.find({}).populate({ path: 'role', select: 'title -_id' });
        res.render('passwords', {
            password
        });
    } catch (error) {
        console.log(error)
    }

}

exports.addPassword = (req, res) => {
    Role.find({},function(err, roles){
        res.render('add_passwords', {
            encodedJson : encodeURIComponent(JSON.stringify(roles)),
            roles
        })
    });
}

//adding new passwords
exports.addNew = async (req, res) => {
    req.checkBody('website', 'Website is required').notEmpty();
    req.checkBody('login', 'Login is required').notEmpty();
    req.checkBody('role', 'Role is required').notEmpty();
    req.checkBody('username', 'username is required').notEmpty();
    req.checkBody('passWord', 'Password is required').notEmpty();

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
        let { website, login, role, username, passWord } = req.body;
        password.website = website;
        password.login = login;
        let roles = role.split(',');
        //console.log(roles)
        let role_ids = [];
        if(roles.length) {
            // find all role _id in db
            try {
                let db_roles = await Role.find({title: {$in: roles}});
                //console.log(db_roles)
                if(db_roles) {
                    for(let db_role of db_roles) {
                        role_ids.push(db_role._id);
                    }
                    //console.log(role_ids)
                }
            } catch (error) {
                //console.log(error);
            }

        }
        password.role = role_ids;
        password.username = username;
        password.password = passWord;
        //console.log(role_ids)
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
exports.passwordsView = async (req, res) => {
    try {
    let passwords = await Password.findById(req.params.id).populate({ path: 'role', select: 'title -_id' });
    let roles = await Role.find({});
    res.render('passwordsView',{
        passwords,
        encodedJson : encodeURIComponent(JSON.stringify(roles)),
        roles
    })
    } catch (error) {
       throw error 
    }
}

//update for passwords
exports.passwordsUpdate = async (req, res) => {
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
        passwords.updatedAT = moment().format('MMMM Do YYYY, h:mm:ss a');
        let id = {_id:req.params.id}
        let roles = passwords.role.split(',');
        let role_ids = [];
        //console.log(roles)
        if(roles.length){
             // find all role _id in db
             try {
                let db_roles = await Role.find({title: {$in: roles}});
                //console.log(db_roles)
                if(db_roles) {
                    for(let db_role of db_roles) {
                        role_ids.push(db_role._id);
                    }
                    //console.log(role_ids)
                }
            } catch (error) {
                console.log(error);
            }

        }           
        passwords.role = role_ids
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

// //Passwords list api for bot 
exports.passwordSite = (req, res) => {
    let password = res.body
    //console.log("test")
    Password.find(password,function(err, password){
        res.send(password)
    });
}


exports.passwordSitePromise = (website, slackrole) => {
    //  console.log("slackrole"+slackrole)
    return Password.findOne({website}).populate({
        path:'role',
        match: { _id: { $eq: slackrole._id }},
        // $match: { _id: slackrole._id },
        select: 'title -_id'
    });
}

