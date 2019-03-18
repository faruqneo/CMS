const Roles = require('../model/role')
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

//adding new roles form page
exports.addForm = (req, res) => {
    res.render('add_roles')
}

//adding new roles
exports.addNew = (req, res) => {
    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('description', 'Description is required').notEmpty();

    let errors = req.validationErrors();

    if(errors)
    {
        res.render('add_roles',{
            errors: errors
        });        
    }
    else
    {
        let roles = new Roles();
        roles.title = titleCase(req.body.title);
        roles.description = req.body.description;
        //res.send(roles)
        roles.save(function(err){
            if(err)
            {
                console.log(err)
            }
            else
            {
                req.flash('success', 'Role Added')
                res.redirect('/cms/dashboard/roles/list')
            }
        });
    }
}

//list view for roles
exports.rolesList = (req, res) => {
    Roles.find({},function(err, roles){
        if(err)
        {
            console.log(err)
        }
        else{
            res.render('roles', {
                roles
            });
        }
    });
}

//detailes view for role
exports.rolesView = (req, res) => {
    Roles.findById(req.params.id,function(err, roles){
            res.render('rolesView', {
                roles
            });
        })
}

//update for roles
exports.rolesUpdate = (req, res) => {
    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('description', 'Description is required').notEmpty();

    let errors = req.validationErrors();
    
    if(errors)
    {
        res.render('rolesView',{
            errors
        }); 
    }
    else
    {
        let roles = req.body;
        roles.updatedAT = moment().format('MMMM Do YYYY, h:mm:ss a')
        let id = {_id:req.params.id}
        //console.log(req.params.id)
        Roles.updateOne(id, roles,function(err){
            if(err)
            {
                console.log(err)
            }
            else
            {
                req.flash('success', 'Role Update')
                res.redirect('/cms/dashboard/roles/list')
            }
        })
    }
}

//role delete 
exports.rolesDelete = (req, res) => {
    let id = {_id:req.params.id}
    Roles.deleteOne(id, function(err){
        if(err)
        {
            console.log(err)
        }
        else
        {
            req.flash('success', 'Role Deleted')
            res.redirect('/cms/dashboard/roles/list')
        }
    })
}

exports.RolePromise = (_id) => {
    return Roles.findById(_id);
}