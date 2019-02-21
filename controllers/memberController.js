const Member = require('../model/member')
const Role = require('../model/role')
const moment = require('moment');


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
                res.redirect('/cms/dashboard/:')
            }
        });
    }
}

//list view for member
exports.memberList = (req, res) => {
    var perPage = 14
    var page = req.params.page || 1
   // var i = parseInt(page > 5) ? parseInt(page - 4) : 1
   
    Member
    .find({})
    .sort('createdAt')
    .skip((perPage * page) - perPage)
    .limit(perPage)
    .exec(function(err, member) {
        Member.countDocuments().exec(function(err, count) {

            let pages = [];
            for(let i=1; i<= Math.ceil(count / perPage); i++)
                {
                        pages.push(i)
                }
               
            if (err) return next(err)
            res.render('dashboard', {
                member: member,
                pages,
                last: Math.ceil(count / perPage)
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
        Role.find({},function(err, roles){
            res.render('add_members',{
                errors,
                roles
            })      
        }); 
    }
    else
    {
        let members = req.body;
        members.updatedAT = moment().format();
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
                res.redirect('/cms/dashboard/1')
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
            res.redirect('/cms/dashboard/1')
        }
    })
}

//Members list api for bot
exports.userName = (req, res) => {
    let member = req.body;
    Member.findOne(member, function(err, data)
    {
        res.send(data)
    })
}