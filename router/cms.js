const express = require('express')
const moment = require('moment')
const authController = require('../controllers/authController')
const rolesController = require('../controllers/rolesController')
const membersController = require('../controllers/memberController')
const passwordController = require('../controllers/passwordController')
const router = express.Router()

// Catalog for the routers
router.use(function timeLog (req, res, next) {
    console.log('Catalog:', moment().format('MMMM Do YYYY, h:mm:ss a'))
    next()
})

//Index page
router.get('/', (req, res) => {
    res.render('home',{layout: false})
})

//Login router
router.post('/login', authController.login)

//Memeber routers
router.get('/dashboard/:page', authController.ensureAthenticated, membersController.memberList)
router.get('/dashboard/members/add', authController.ensureAthenticated, membersController.addMember)
router.post('/dashboard/members/new_add', authController.ensureAthenticated, membersController.addNew)
router.get('/dashboard/members/edit/:id', authController.ensureAthenticated, membersController.membersView)
router.post('/dashboard/update/members/:id', authController.ensureAthenticated, membersController.membersUpdate)
router.get('/dashboard/memebers/delete/:id', authController.ensureAthenticated, membersController.membersDelete)
router.post('/members/name',membersController.userName)

//Password routers
router.get('/dashboard/passwords/list', authController.ensureAthenticated, passwordController.passwordList)
router.get('/dashboard/password/add', authController.ensureAthenticated, passwordController.addPassword)
router.post('/dashboard/passwords/new_add', authController.ensureAthenticated, passwordController.addNew)
router.get('/dashboard/password/edit/:id', authController.ensureAthenticated, passwordController.passwordsView)
router.post('/dashboard/update/passwords/:id', authController.ensureAthenticated, passwordController.passwordsUpdate)
router.get('/dashboard/password/delete/:id', authController.ensureAthenticated, passwordController.passwordsDelete)
router.post('/password/website', passwordController.passwordSite)

//Role routers
router.get('/dashboard/roles/list', authController.ensureAthenticated, rolesController.rolesList)
router.get('/dashboard/roles/add', authController.ensureAthenticated, rolesController.addForm)
router.post('/dashboard/roles/new_add', authController.ensureAthenticated, rolesController.addNew)
router.get('/dashboard/roles/edit/:id', authController.ensureAthenticated, rolesController.rolesView)
router.post('/dashboard/update/roles/:id', authController.ensureAthenticated, rolesController.rolesUpdate)
router.get('/dashboard/roles/delete/:id', authController.ensureAthenticated, rolesController.rolesDelete)

//logout router
router.get('/logout', authController.ensureAthenticated, authController.logout)

module.exports = router