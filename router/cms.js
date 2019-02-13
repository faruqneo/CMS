const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')

router.get('/', (req, res) => {
    res.render('home',{layout: false})
})

router.get('/dashboard', authController.ensureAthenticated, (req, res) => {
    res.render('dashboard')
})

router.get('/logout', authController.ensureAthenticated, authController.logout)

router.post('/login', authController.login)

module.exports = router