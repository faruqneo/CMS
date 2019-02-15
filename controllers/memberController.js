const Member = require('../model/member')
const Role = require('../model/role')


exports.addMember = (req, res) => {
    Role.find({},function(err, roles){
        res.render('add_members', {
            roles
        })
    });
}

//adding new roles
exports.addNew = (req, res) => {
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('role', 'Role is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();

    let errors = req.validationErrors();

    if(errors)
    {
        Role.find({},function(err, roles){
            res.render('add_members',{
                errors,
                roles
            })      
        });  
    }
    else
    {
        let member = new Member();
        member.name = req.body.name;
        member.email = req.body.email;
        member.role = req.body.role;
        member.password = req.body.password;
        //res.json(member)
        member.save(function(err){
            if(err)
            {
                console.log(err)
            }
            else
            {
                req.flash('success_msg', 'Member Added')
                res.redirect('/cms/dashboard')
            }
        });
    }
}

//list view for member
exports.memberList = (req, res) => {
    var i = page > 5 ? page - 4 : 1;
    var perPage = 10
    var page = req.params.page || 1
    Member
    .find({})
    .skip((perPage * page) - perPage)
    .limit(perPage)
    .exec(function(err, member) {
        Member.countDocuments().exec(function(err, count) {
            if (err) return next(err)
            res.render('dashboard', {
                member: member,
                current: page,
                i,
                pages: Math.ceil(count / perPage),
                helpers: {
                    eq: function (v1, v2) {
                        return v1 === v2;
                    },
                    ne: function (v1, v2) {
                        return v1 !== v2;
                    },
                    lt: function (v1, v2) {
                        return v1 < v2;
                    },
                    gt: function (v1, v2) {
                        return v1 > v2;
                    },
                    lte: function (v1, v2) {
                        return v1 <= v2;
                    },
                    gte: function (v1, v2) {
                        return v1 >= v2;
                    },
                    and: function (v1, v2) {
                        return v1 && v2;
                    },
                    or: function (v1, v2) {
                        return v1 || v2;
                    }
                }
            })
        })
    })

    // Member.find({},function(err, member){
    //     if(err)
    //     {
    //         console.log(err)
    //     }
    //     else{
    //         res.render('dashboard', {
    //             member
    //         });
    //     }
    // });
}

//detailes view for members
exports.membersView = (req, res) => {
    Member.findById(req.params.id,function(err, members){
        Role.find({}).sort('createdAt').exec(function(err, roles){
            res.render('membersView', {
                members,
                roles
            });
        })
    })
}

//update for members
exports.membersUpdate = (req, res) => {
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('role', 'Role is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();

    let errors = req.validationErrors();
    
    if(errors)
    {
        res.render('membersView',{
            errors
        }); 
    }
    else
    {
        let members = req.body;
        let id = {_id:req.params.id}
        //console.log(req.params.id)
        Member.updateOne(id, members,function(err){
            if(err)
            {
                console.log(err)
            }
            else
            {
                req.flash('success', 'Member Update')
                res.redirect('/cms/dashboard')
            }
        })
    }
}

//role delete 
exports.membersDelete = (req, res) => {
    let id = {_id:req.params.id}
    Member.deleteOne(id, function(err){
        if(err)
        {
            console.log(err)
        }
        else
        {
            req.flash('success', 'Member Deleted')
            res.redirect('/cms/dashboard')
        }
    })
}