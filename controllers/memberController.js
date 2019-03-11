const Member = require('../model/member')
const Role = require('../model/role')
const User = require('../model/user')
const moment = require('moment')
const bcrypt = require('bcryptjs')
const CryptoJS = require("crypto-js");

function titleCase(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    }
    // Directly return the joined string
    return splitStr.join(' '); 
 }

exports.addMember = (req, res) => {
    Role.find({},function(err, roles){
        res.render('add_members', {
            roles
        })
    });
}

//adding new roles
exports.addNew =  (req, res) => {
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
        member.name = titleCase(req.body.name);
        member.email = req.body.email;
        member.role = req.body.role
        /* Password Encryption */
        member.password = CryptoJS.AES.encrypt(req.body.password, 'secret key 123');
        console.log("checking")
        member.save(async function(err){
            if(err)
            {
                console.log(err)
            }
            else
            {
              let role =await Role.findById(member.role);
              //console.log(role)
            if(role.title === 'admin')
            {
                let user = new User()
                user.username = member.email;
                console.log("member.password");
                console.log("-------------");
                console.log(member.password);
                console.log("-------------");
                bcrypt.genSalt(10, function(err, salt){
                    let bytes  = CryptoJS.AES.decrypt(member.password.toString(), 'secret key 123');
                    let plaintext = bytes.toString(CryptoJS.enc.Utf8);
                    bcrypt.hash(plaintext, salt, async function(err, hash){
                       try {
                        if(err)
                        {
                            console.log(err)
                        }
                        user.password = await hash;
                       // console.log({user});
                        await user.save()
                        //console.log("check")
                        if(err)
                        {
                            console.log(err)
                            return;
                        }
                         
                       } catch (error) {
                           throw error
                       }
                    });
                });
            }
            //console.log("something")
            return res.redirect('/cms/dashboard/:')  
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
    .populate({ path: 'role', select: 'title -_id' })
    .sort('createdAt')
    .skip((perPage * page) - perPage)
    .limit(perPage)
    .exec(function(err, member) {
        Member.countDocuments().exec(function(err, count) {
           // console.log(count)
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
    Member.findById(req.params.id).populate({ path: 'role', select: 'title -_id' }).exec(function(err, members){
    /* Password Decryption */
    let bytes  = CryptoJS.AES.decrypt(members.password.toString(), 'secret key 123');
    let plaintext = bytes.toString(CryptoJS.enc.Utf8);
        Role.find({}).sort('createdAt').exec(function(err, roles){
            res.render('membersView', {
                members,
                plaintext,
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
        let plantext = req.body.password;
        members.password = CryptoJS.AES.encrypt(plantext, 'secret key 123');
        console.log(members.password);
        members.updatedAT = moment().format('MMMM Do YYYY, h:mm:ss a');
        let id = {_id:req.params.id}
        //console.log(req.params.id)
        Member.updateOne(id, members,async function(err){
            if(err)
            {
                console.log(err)
            }
            else
            {   
                
                try {
                    let role =await Role.findById(members.role);
                    console.log(role)
                  if(role.title === 'admin')
                  {
                      let user = new User()
                      user.username = members.email;
                      console.log("members.password");
                      console.log("--------------------");
                      console.log(members.password);
                      console.log("--------------------");
                      bcrypt.genSalt(10, function(err, salt){
                          let bytes  = CryptoJS.AES.decrypt(members.password.toString(), 'secret key 123');
                          let plaintext = bytes.toString(CryptoJS.enc.Utf8);
                          console.log("plantext");
                          console.log("--------------------");
                          console.log(plaintext);
                          console.log("--------------------");
                          bcrypt.hash(plaintext, salt, async function(err, hash){
                             try {
                              
                              user.password = await hash;
                             // console.log({user});
                              await user.save()
                              //console.log("check")
                              if(err)
                              {
                                  console.log(err)
                                  return;
                              }
                               
                             } catch (error) {
                                 throw error
                             }
                          });
                      });
                  }
                } catch (error) {
                    console.log(error)
                }
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
    console.log(req.isPermitted)
    if(req.isPermitted)
    {
        let member = req.body;
            Member.findOne(member, function(err, data)
            {
                // console.log(data)
              res.send(data)
            })
    } else {
        res.status(401).send({msg: "UnAuthenticated"})
    }
}

