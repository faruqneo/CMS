const Project = require('../model/project');
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



//adding new passwords
exports.addNew = async (req, res) => {
    //console.log(req.body)
        let project = new Project();
        let { pname, branch, bitbucket_link, client_name, manager, role, member, domains, ec2, pem } = req.body;
        project.name = pname;
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
        project.members = member_ids;
       
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
        project.roles = role_ids;

        project.save()
        .then(() => {
            console.log("--------------");
            console.log("project");
            console.log("---------------");
            console.log(`${pname} is added.`);
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


//project delete 
exports.projectsDelete = (req, res) => {
    let id = {_id:req.params.id}
    Project.deleteOne(id, function(err){
        if(err)
        {
            console.log(err)
        }
        else
        {
            res.redirect('/cms/dashboard/credentials/list?tab=project')
        }
    })
}


//detailes view for project
exports.projectsView = async (req, res) => {
    try {
        let project =  await Project.findById(req.params.id).populate({ path: 'roles', select: 'title -_id' }).populate({ path: 'members', select: 'name -_id' });
    /* Password Decryption */

    let role = await Role.find({});
    let member = await Member.find({});
    res.render('uc');
    // res.render('projectsView',{
    //     member,
    //     project,
    //     role
    // })
    } catch (error) {
       console.log(error)
    }
}

//update for projects
exports.projectsUpdate = async (req, res) => {
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
        res.render('projectsView',{
            errors
        }); 
    }
    else
    {
        let projects = req.body;
        projects.updatedAT = moment().format('MMMM Do YYYY, h:mm:ss a');
        // passwords.password = CryptoJS.AES.encrypt(passwords.password, 'secret key 123');
        let id = {_id:req.params.id}
        let roles = projects.roles.split(',');
        let members = projects.members.split(',');
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
        projects.roles = role_ids
        projects.members = member_ids
        projects.updateOne(id, projects,function(err){
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


exports.projectSidePromise = (item, slackrole, slackmember) => {
   // console.log("slackrole "+slackrole+" \nslackmember"+slackmember)
    if(slackrole != null && slackmember != null)
   { 
       console.log("condition 1")
    return Project.findOne({name: item}).populate({
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
       return Project.findOne({name: item}).populate({
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
      return Project.findOne({name: item}).populate({
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