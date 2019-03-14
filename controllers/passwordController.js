const Password = require('../model/password');
const Role = require('../model/role');
const moment = require('moment');   

// function for name
function titleCase(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    }
    // Directly return the joined string
    return splitStr.join(' ').trim(); 
 }

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
    req.checkBody('project', 'Project is required').notEmpty();
    req.checkBody('branch', 'Branch is required').notEmpty();
    req.checkBody('bitbucket_link', 'Bitbucket Link is required').notEmpty();
    req.checkBody('client_name', 'Client Name is required').notEmpty();
    req.checkBody('manager', 'Manager is required').notEmpty();
    req.checkBody('role', 'Role is required').notEmpty();
    req.checkBody('domains', 'Domain is required').notEmpty();
    req.checkBody('ec2', 'EC2 is required').notEmpty();

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
        let { project, branch, bitbucket_link, client_name, manager, role, domains, ec2, pem } = req.body;
        password.project = project;
        password.branch = branch;
        password.bitbucket_link= bitbucket_link;
        password.client_name = titleCase(client_name);
        password.manager = titleCase(manager);
        password.domains = domains;
        password.ec2 = ec2;
        password.pem = pem;
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
        password.save(function(err){
            if(err)
            {
                res.render('add_passwords', {
                    encodedJson : encodeURIComponent(JSON.stringify(roles)),
                    roles,
                    error: "This project is already exist."
                })
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
    /* Password Decryption */

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
    req.checkBody('project', 'project is required').notEmpty();
    req.checkBody('branch', 'branch is required').notEmpty();
    req.checkBody('bitbucket_link', 'bitbucket_link is required').notEmpty();
    req.checkBody('client_name', 'client_name is required').notEmpty();
    req.checkBody('manager', 'manager is required').notEmpty();
    req.checkBody('role', 'role is required').notEmpty();
    req.checkBody('domains', 'domains is required').notEmpty();
    req.checkBody('ec2', 'ec2 is required').notEmpty();
    req.checkBody('pem', 'pem is required').notEmpty();

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
        // passwords.password = CryptoJS.AES.encrypt(passwords.password, 'secret key 123');
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
                console.log("err")
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


exports.passwordSitePromise = (project, slackrole) => {
    //  console.log("slackrole"+slackrole)
    return Password.findOne({project}).populate({
        path:'role',
        match: { _id: { $eq: slackrole._id }},
        // $match: { _id: slackrole._id },
        select: 'title -_id'
    });
}

