const Password = require('../model/password');
const Project  = require('../model/project');
const Website = require('../model/website');
const Role = require('../model/role');
const Member = require('../model/member');
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
        let project = await Project.find({}).populate({ path: 'roles', select: 'title -_id' }).populate({ path: 'members', select: 'name -_id' }).limit(10);
        let website =  await Website.find({}).populate({ path: 'roles', select: 'title -_id' }).populate({ path: 'members', select: 'name -_id' }).limit(10);
        //console.log(req.query)
        res.render('passwords', {
            tab: req.query.tab,
            project,
            website
        });
    } catch (error) {
        console.log(error)
    }

}

exports.addPassword =async (req, res) => {
    let members = await Member.find({});
    let roles = await Role.find({});
   // roles = roles.concat(memberArray);
    res.render('add_passwords', {
        encodedRole : encodeURIComponent(JSON.stringify(roles)),
        encodeMember : encodeURIComponent(JSON.stringify(members))
    });
}

// //adding new passwords
exports.addNew = async (req, res) => {
    req.checkBody('name', 'Project Name is required').notEmpty();
//    req.checkBody('branch', 'Branch is required').notEmpty();
    req.checkBody('bitbucket_link', 'Bitbucket Link is required').notEmpty();
    req.checkBody('client_name', 'Client Name is required').notEmpty();
    req.checkBody('manager', 'Manager Name is required').notEmpty();
    req.checkBody('role', 'Role is required').notEmpty();
    req.checkBody('domains', 'Domain is required').notEmpty();
    req.checkBody('ec2', 'EC2 is required').notEmpty();

    let errors = req.validationErrors();

    if(errors)
    {
        let roles = await Role.find({});
        res.render('add_passwords',{
            errors,
            roles
        })  
    }
    else
    {
        let project = new Project();
        let { name, branch, bitbucket_link, client_name, manager, role, member, domains, ec2, pem } = req.body;
        project.name = name;
        console.log(branch)
        if(branch != null && branch != '')
        {
            project.branch = branch;
        }
        else
        {
            project.branch = "master";
        }
        //project.branch = branch;
        project.bitbucket_link= bitbucket_link;
        project.client_name = titleCase(client_name);
        project.manager = titleCase(manager);
        project.domains = domains;
        project.ec2 = ec2;
        project.pem = pem;

        let members = member.split(',');
        let member_ids = [];
        if(members.length) {
            // find all role _id in db
            try {
                let db_members = await Member.find({name: {$in: members}});
                //console.log(db_roles)
                if(db_members) {
                    for(let db_member of db_members) {
                        member_ids.push(db_member._id);
                    }
                    //console.log(role_ids)
                }
            } catch (error) {
                //console.log(error);
            }

        }
        project.member = member_ids;

        let roles = role.split(',');
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
        project.role = role_ids;

        project.save()
        .then(() => res.redirect('/cms/dashboard/passwords/list'))
        .catch((errors) => {
            res.render('add_passwords',{
                encodedJson : encodeURIComponent(JSON.stringify(roles)),
                roles,
                error: errors               
            })
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

