const Roles = require('../model/role')


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
                req.flash('success', 'Role Added') // not working
                res.redirect('/cms/dashboard/roles')
            }
        });
    }
}

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