//const Project = require('../model/project');
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

 exports.addPassword =async (req, res) => {
    let members = await Member.find({});
    let roles = await Role.find({});
   // roles = roles.concat(memberArray);
    res.render('add_passwords', {
        encodedRole : encodeURIComponent(JSON.stringify(roles)),
        encodeMember : encodeURIComponent(JSON.stringify(members))
    });
}

//adding new website
exports.addNew = async (req, res) => {
    
        let website = new Website();
        let { name, login, roles, members, username, password } = req.body;
        website.name = name;
        website.login= login;
        website.username = username;
        website.password = password;

        let member = members.split(',');
        let member_ids = [];
        if(member.length) {
            // find all role _id in db
            try {
                let db_members = await Member.find({email: {$in: members}});
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
        website.members = member_ids;

        let role = roles.split(',');
        let role_ids = [];
        if(role.length) {
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
        website.roles = role_ids;

        website.save()
        .then(() => {
            console.log("--------");
            console.log("website");
            console.log("---------");
            console.log(`${name} is added.`);
            console.log("---------");
            res.redirect('/cms/success');
        })
        .catch((errors) => {
            res.render('add_passwords',{
                encodedJson : encodeURIComponent(JSON.stringify(roles)),
                roles,
                error: errors               
            })
        });
    
}

//website delete 
exports.websitesDelete = (req, res) => {
    let id = {_id:req.params.id}
    Website.deleteOne(id, function(err){
        if(err)
        {
            console.log(err)
        }
        else
        {
            res.redirect('/cms/dashboard/credentials/list?tab=website')
        }
    })
}

//detailes view for website
exports.websitesView = async (req, res) => {
    try {
        let website =  await Website.findById(req.params.id).populate({ path: 'roles', select: 'title -_id' }).populate({ path: 'members', select: 'name -_id' });
    /* Password Decryption */

    let roles = await Role.find({});
    let members = await Member.find({});
    res.render('uc');
    // res.render('websitesView',{
    //     members,
    //     website,
    //     roles
    // })
    } catch (error) {
       console.log(error)
    }
}


//update for website
exports.websitesUpdate = async (req, res) => {
    req.checkBody('website', 'website is required').notEmpty();
    req.checkBody('login', 'login is required').notEmpty();
    req.checkBody('roles', 'roles is required').notEmpty();
 //   req.checkBody('members', 'members is required').notEmpty();
    req.checkBody('username', 'username is required').notEmpty();
    req.checkBody('pepasswordm', 'password is required').notEmpty();

    let errors = req.validationErrors();
    
    if(errors)
    {
        res.render('websitesView',{
            errors
        }); 
    }
    else
    {
        let websites = req.body;
        websites.updatedAT = moment().format('MMMM Do YYYY, h:mm:ss a');
        // passwords.password = CryptoJS.AES.encrypt(passwords.password, 'secret key 123');
        let id = {_id:req.params.id}
        let roles = websites.roles.split(',');
        let members = websites.members.split(',');
        let member_ids = [];
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
        if(members.length){
            // find all role _id in db
            try {
               let db_members = await Member.find({email: {$in: members}});
               //console.log(db_roles)
               if(db_members) {
                   for(let db_member of db_members) {
                    member_ids.push(db_member._id);
                   }
                   //console.log(role_ids)
               }
           } catch (error) {
               console.log(error);
           }

       }          
       websites.roles = role_ids
       websites.members = member_ids
       websites.updateOne(id, websites,function(err){
            if(err)
            {
                console.log("err")
            }
            else
            {
                res.redirect('/cms/dashboard/credentials/list')
            }
        })
    }
}

exports.websiteSidePromise = (password, slackrole, slackmember) => {
      console.log("slackrole"+slackrole+"item"+password+"slackmember"+slackmember)
    if(slackrole != null && slackmember != null)
   { 
       console.log("condition 1")
    return Website.findOne({name: password}).populate({
        path:'roles',
    //    match: { _id: { $eq: slackrole._id }},
        select: 'title -_id'
    }).populate({
        path:'members',
    //    $match: { _id: slackmember._id },
        select: 'name -_id'       
    });
   }
   
    else if(slackrole != null && slackmember == null)
    {
        console.log("condition 2")
       return Website.findOne({name: item}).populate({
        path:'roles',
    //    match: { _id: { $eq: slackrole._id }},
        select: 'title -_id'
    }).populate({
        path:'members',
    //    $match: { _id: slackmember._id },
        select: 'name -_id'       
    });
    }

    else
    {
        console.log("else condition")
      return Website.findOne({name: item}).populate({
        path:'roles',
     //   match: { _id: { $eq: slackrole._id }},
        select: 'title -_id'
    }).populate({
        path:'members',
    //    $match: { _id: slackmember._id },
        select: 'name -_id'       
    });
    }
}