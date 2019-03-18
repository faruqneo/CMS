const express = require('express')
const exphbs = require('express-handlebars')
const mongoose = require('mongoose')
const session = require('express-session')
const bodyParser = require('body-parser')
const SlackBots = require('slackbots')
const axios = require('axios')
const expressValidator = require('express-validator')
const path = require('path')
const config = require('./config/database')
const passport = require('passport')
const cms = require('./router/cms')
const { passwordSitePromise } = require('./controllers/passwordController');
const { projectSidePromise } = require('./controllers/projectController');
const { websiteSidePromise } = require('./controllers/websiteController');
const { individualSitePromise } = require('./controllers/individualController');
const { RolePromise } = require('./controllers/rolesController');
const { MemberPromise } = require('./controllers/memberController');
require('dotenv').config()
const PORT = process.env.PORT || 5000

//Init app
const app = express()

//connection code for mongodb
mongoose.connect(config.database, { useCreateIndex: true, useNewUrlParser: true})
.then(() => console.log("connected with mongodb"))
.catch(error => console.log(error));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//setting public folder
app.use("/public", express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


//setting up view pages
app.engine('handlebars', exphbs({
    defaultLayout: 'main',
    helpers: {
        // Function to do basic mathematical operation in handlebar
        math: function (lvalue, operator, rvalue) {
            lvalue = parseFloat(lvalue);
            rvalue = parseFloat(rvalue);
            return {
                "+": lvalue + rvalue,
                "-": lvalue - rvalue,
                "*": lvalue * rvalue,
                "/": lvalue / rvalue,
                "%": lvalue % rvalue
            }[operator];
        },
        objToRole: function (arr) {
            arr = arr.map(a => a.title);
            // arr = arr.join(', ');
            // arr = arr.split(',');
            //console.log(arr)
            return arr;
        },
        objToMember: function (arr) {
            arr = arr.map(a => a.name);
            // arr = arr.join(', ');
            // arr = arr.split(',');
            //console.log(arr)
            return arr;
        }
    }
}));

app.set('view engine', 'handlebars');

//express session middleware
app.use(session({
    secret: 'secret',
    saveUninitialized: false,
    resave: false
}));
//Password middelware
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next){
   // console.log({s:req.user});
    if(typeof global.permitted === "boolean") {
        app.locals.permitted = global.permitted;
    } else {
        app.locals.permitted = req.user ? req.user.permitted : false;
    }
    //console.log(req.permitted)
    next();
});

//express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

//express validator
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

//Passport config
require('./config/passport')(passport)

//router path
app.use('/cms', cms)

app.use('/', (req, res) => {
    res.send('hukum mere aaka')
})

//checking for user
app.get('*', function (req, res, next) {
    res.locals.user = req.user || null;
    next();
})


//create a bot
const bot = new SlackBots({
    token: process.env.slack_bot_token,
    name: 'genie'
});

//bot start
bot.on('start', () => {
   // bot.postMessageToChannel('testing', 'Hii')
})
//error checking
bot.on('error', (err) => console.log(err))

//message checking
bot.on('message', (data) => {
    
    if (data.type != 'message') {
        return;
    }
    if (data.text.startsWith('<@UGGR0QUDR>'))
        handleMessage(data)
    
})


//message handling
function handleMessage(message) {
    let str = message.text.split('<@UGGR0QUDR>')
    let lower = str[1].toLowerCase()
    console.log(lower)
    if (lower.includes('show project password for')) {
        let slackrequest = lower.split(' ')
        let password = slackrequest[5];
        bot.getUserById(message.user)
            .then((details) => {
                let slackemail = details.profile.email
                let member = []
                let slackrole, slackmember
                
                //getting members list through API
                axios({
                    method: 'post',
                    url: 'http://localhost:5000/cms/members/name',
                    data: {
                        email: slackemail
                    }
                }).then(async (res) => {
                   // console.log(res)
                    try {
                        member.push({ "_id": res.data._id,"name": res.data.name, "email": res.data.email, "role": res.data.role})
    
                        slackrole = await RolePromise(member[0].role)
                        slackmember = await MemberPromise(member[0]._id)
                        //console.log(slackrole)
                        // console.log("------------")
                        let project = await projectSidePromise(password, slackrole, slackmember);
                        console.log(project)
                        if(project != null || slackrole.title === "admin" )
                        {
                            console.log("project "+project)
                            console.log("User role " +slackrole.title)
                            let rolePas = '';
                            let  memberPas = '';

                            if(project.roles.length != 0 || project.members.length != 0){
                                rolePas = project.roles;
                                memberPas = project.members;
                                console.log("_____________________")
                                console.log(rolePas[0].title);
                                console.log(memberPas[0].name)
                                console.log(project.roles);
                                console.log(project.members)
                                console.log("_________________")
                            }else if(project.roles.length == 0 || project.members.length == 0){
                                bot.postMessage(message.user, 'You have no privilages.')
                             }
                            
                            
                            //console.log("assign role " + rolePas[0].title);
                            
                            if (rolePas[0].title === slackrole.title || slackrole.title == "admin" || memberPas[0].name === slackmember.name) {
                                //console.log(passwords.login+" "+passwords.username+" "+passwords.password)

                                

                                bot.postMessage(message.user, `Project Name: ${project.name} \nBranch: ${project.branch} \nRepository: https://${project.bitbucket_link} \nClient Name: ${project.client_name} \nManager: ${project.manager} \nDomains: https://${project.domains} \nEC2: ${project.ec2} \npem filename: ${project.pem}`)
                            }
                            
                            else {
                                // code
                            }
                        }
                        else
                            {bot.postMessage(message.user, 'This project is not in list');}
                    } catch (error) {
                        console.log(error);
                        // bot.postMessage(message.user, 'You have no privilages.')
                    }

                })
                    .catch((err) => {
                        console.log(err);
                        bot.postMessage(message.user, 'Please contact to admin.')
                    })
            })
            .catch(error => {console.log(error)})
    }
    else if(lower.includes('show website password for'))
    {
        let slackrequest = lower.split(' ')
        let password = slackrequest[5];
        bot.getUserById(message.user)
            .then((details) => {
                let slackemail = details.profile.email
                let member = []
                let slackrole, slackmember
                
                //getting members list through API
                axios({
                    method: 'post',
                    url: 'http://localhost:5000/cms/members/name',
                    data: {
                        email: slackemail
                    }
                }).then(async (res) => {
                   // console.log(res)
                    try {
                        member.push({ "id": res.data._id, "name": res.data.name, "email": res.data.email, "role": res.data.role})
    
                        slackmember = await MemberPromise(member[0].id);
                        slackrole = await RolePromise(member[0].role);
                        
                        //console.log(developer.email);

                        let website = await websiteSidePromise(password, slackrole, slackmember);
                        if(website != null || slackrole.title === "admin")
                        {

                            console.log("website "+website)
                            console.log("User role " +slackrole.title)
                            let rolePas = '';
                            let  memberPas = '';

                            if(website.roles.length != 0 || website.members.length != 0){
                                rolePas = website.roles;
                                memberPas = website.members;
                                console.log("_____________________")
                             //   console.log(rolePas[0].title);
                             //   console.log(memberPas[0].name)
                                console.log(website.roles);
                                console.log(website.members)
                                console.log("_________________")
                            }else if(website.roles.length == 0 || website.members.length == 0){
                                bot.postMessage(message.user, 'You have no privilages.')
                             }
                            
                            
                            //console.log("assign role " + rolePas[0].title);
                            
                             if (rolePas[0].title === slackrole.title || slackrole.title == "admin" || memberPas[0].name === slackmember.name) {
                                //console.log(passwords.login+" "+passwords.username+" "+passwords.password)
                                
                                bot.postMessage(message.user, `Website Name: ${website.name} \nLogin: https://${website.login}  \nUsername: ${website.username} \nPassword: ${website.password}`)
                            }
                            
                            else {
                                // code
                            }
                            
                        }
                        else
                        {bot.postMessage(message.user, 'This website is not in list');}

                        
                    } catch (error) {
                        console.log(error);
                        // bot.postMessage(message.user, 'You have no privilages.')
                    }

                })
                    .catch((err) => {
                        console.log(err);
                        bot.postMessage(message.user, 'Please contact to admin')
                    })
            })
            .catch(error => {console.log(error)})
    }
    else {
        bot.postMessage(message.user, 'Please enter in this format, eg:"show project password for <Project_name>" or "show website password for <Website_name>" ')
    }
}

//server is listening
app.listen(PORT, () => {
    console.log('server is running')
})