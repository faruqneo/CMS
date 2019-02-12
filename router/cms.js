const express = require('express')
const router = express.Router()
const passport = require('passport')

router.get('/', (req, res) => {
    res.render('home',{layout: false})
})

router.get('/success', (req, res) => {
    res.render('dashboard')
})

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/cms');
})

router.post('/login',
    passport.authenticate('local',{
        successRedirect: '/cms/success',
        failureRedirect: '/cms',
        failureFlash: 'false'
    })
)

module.exports = router