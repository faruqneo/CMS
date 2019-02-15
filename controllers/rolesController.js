const Roles = require('../model/role')

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
        roles.title = req.body.title;
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
                res.redirect('/cms/dashboard/roles')
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
                res.redirect('/cms/dashboard/roles')
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
            res.redirect('/cms/dashboard/roles')
        }
    })
}