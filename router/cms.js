const express = require('express')
const authController = require('../controllers/authController')
const rolesController = require('../controllers/rolesController')
const router = express.Router()

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

//roles routers
router.get('/dashboard/roles', authController.ensureAthenticated, rolesController.rolesList)
router.get('/dashboard/roles/add', authController.ensureAthenticated, (req, res) => {
    res.render('add_roles')
})
router.post('/dashboard/roles/new_add', authController.ensureAthenticated, rolesController.addNew)
router.get('/dashboard/roles/edit/:id', authController.ensureAthenticated, rolesController.rolesView)
router.post('/dashboard/update/roles/:id', authController.ensureAthenticated, rolesController.rolesUpdate)
router.get('/dashboard/roles/delete/:id', authController.ensureAthenticated, rolesController.rolesDelete)

//logout routes
router.get('/logout', authController.ensureAthenticated, authController.logout)


module.exports = router