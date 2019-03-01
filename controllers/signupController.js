const User = require('../model/user')
const bcrypt = require('bcryptjs')

exports.signup= (req, res) => {
    try {
        let user = new User();
         user.username = req.body.username
         let password = req.body.password

         bcrypt.genSalt(10, function(err, salt){
            bcrypt.hash(password, salt, async function(err, hash){
                user.password = await hash;
                 user.save(function(err){
                     if(err)
                     {
                         console.log(err)
                     }
                     else
                     {
                        res.redirect('/cms')
                     }
                 })
                 
            })
         })
        

    
    } catch (error) {
        console.log(error)
    }
}