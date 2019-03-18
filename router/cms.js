const express = require('express')
const moment = require('moment')
const authController = require('../controllers/authController')
const rolesController = require('../controllers/rolesController')
const membersController = require('../controllers/memberController')
const passwordController = require('../controllers/passwordController')
const individualController = require('../controllers/individualController')
const projectController = require('../controllers/projectController')
const websiteController = require('../controllers/websiteController')
//const signupController = require('../controllers/signupController')
const Switch1 = require('../model/switch')
const router = express.Router()

// Catalog for the routers
router.use(function timeLog(req, res, next) {
    console.log('Catalog:', moment().format('MMMM Do YYYY, h:mm:ss a'))
    next()
})


//Index page
router.get('/', (req, res) => {
    res.render('home', { layout: false })
})

// router.get('/signup', (req, res) => {
//     res.render('signup', { layout: false })
// })

// router.post('/signup', signupController.signup)

//Index page
router.post('/save-check', async (req, res) => {
    try {
        if (req.body) {
            let checkStatus = req.body.status12;
            let addObj = new Switch1();
           // console.log({b:req.body})
            addObj.status = checkStatus;
            req.user.permitted = checkStatus;
            global.permitted = checkStatus;
            //console.log(addObj)
           let button = await addObj.save()
        //    res.render('main',{
        //        button
        //    })
        } else {
            return "Status undefined";
        }
    } catch (error) {
        console.log(error)
    }

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
 router.post('/members/name',authController.ensurePermission, membersController.userName)

// //Password routers
 router.get('/dashboard/credentials/list', authController.ensureAthenticated, passwordController.passwordList)
 router.get('/dashboard/credentials/add',authController.ensureAthenticated, passwordController.addPassword)
//  router.post('/dashboard/passwords/new_add', authController.ensureAthenticated, passwordController.addNew)
//  router.get('/dashboard/password/edit/:id', authController.ensureAthenticated, passwordController.passwordsView)
//  router.post('/dashboard/update/passwords/:id', authController.ensureAthenticated, passwordController.passwordsUpdate)
//  router.get('/dashboard/password/delete/:id', authController.ensureAthenticated, passwordController.passwordsDelete)

// Project & Website routers
 router.post('/dashboard/project/new_add', authController.ensureAthenticated, projectController.addNew)
 router.post('/dashboard/website/new_add', authController.ensureAthenticated, websiteController.addNew)
 router.get('/dashboard/project/edit/:id', authController.ensureAthenticated, projectController.projectsView)
 router.post('/dashboard/update/project/:id', authController.ensureAthenticated, projectController.projectsUpdate)
 router.get('/dashboard/website/edit/:id', authController.ensureAthenticated, websiteController.websitesView)
 router.post('/dashboard/update/website/:id', authController.ensureAthenticated, websiteController.websitesUpdate)
 router.get('/dashboard/project/delete/:id', authController.ensureAthenticated, projectController.projectsDelete)
 router.get('/dashboard/website/delete/:id', authController.ensureAthenticated, websiteController.websitesDelete)


// //Individual routers
 router.get('/dashboard/individual/list', authController.ensureAthenticated, individualController.individualList)
 router.get('/dashboard/individual/add', authController.ensureAthenticated, individualController.addIndividual)
 router.post('/dashboard/individual/new_add', authController.ensureAthenticated, individualController.addNew)
 router.get('/dashboard/individual/edit/:id', authController.ensureAthenticated, individualController.individualsView)
 router.post('/dashboard/update/individuals/:id', authController.ensureAthenticated, individualController.individualsUpdate)
 router.get('/dashboard/individual/delete/:id', authController.ensureAthenticated, individualController.individualsDelete)

// //Role routers
 router.get('/dashboard/roles/list', authController.ensureAthenticated, rolesController.rolesList)
 router.get('/dashboard/roles/add', authController.ensureAthenticated, rolesController.addForm)
 router.post('/dashboard/roles/new_add', authController.ensureAthenticated, rolesController.addNew)
 router.get('/dashboard/roles/edit/:id', authController.ensureAthenticated, rolesController.rolesView)
 router.post('/dashboard/update/roles/:id', authController.ensureAthenticated, rolesController.rolesUpdate)
 router.get('/dashboard/roles/delete/:id', authController.ensureAthenticated, rolesController.rolesDelete)

// //logout router
 router.get('/logout', authController.ensureAthenticated, authController.logout)

module.exports = router;