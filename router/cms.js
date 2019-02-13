const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const rolesController = require('../controllers/rolesController')

router.get('/', (req, res) => {
    res.render('home',{layout: false})
})

router.post('/login', authController.login)

router.get('/dashboard', authController.ensureAthenticated, (req, res) => {
    res.render('dashboard')
})

router.get('/dashboard/members/add', authController.ensureAthenticated, (req, res) => {
    res.render('add_members')
})

router.get('/dashboard/passwords', authController.ensureAthenticated, (req, res) => {
    res.render('passwords')
})

router.get('/dashboard/password/add', authController.ensureAthenticated, (req, res) => {
    res.render('add_passwords')
})

router.get('/dashboard/password/add', authController.ensureAthenticated, (req, res) => {
    res.render('add_passwords')
})

router.get('/dashboard/roles', authController.ensureAthenticated, rolesController.rolesList)

router.get('/dashboard/roles/add', authController.ensureAthenticated, (req, res) => {
    res.render('add_roles')
})

router.post('/dashboard/roles/new_add', authController.ensureAthenticated, rolesController.addNew)

// router.post('/dashboard/roles/edit/:id', authController.ensureAthenticated, )

router.get('/logout', authController.ensureAthenticated, authController.logout)


module.exports = router