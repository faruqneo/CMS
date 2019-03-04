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
const { RolePromise } = require('./controllers/rolesController');
require('dotenv').config()
const PORT = process.env.PORT || 5000

//Init app
const app = express()

//connection code for mongodb
mongoose.connect(config.database, { useNewUrlParser: true });
let db = mongoose.connection;

//checking for connection
db.once('open', function () {
    console.log("connected with mongodb")
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//setting public folder
app.use("/public", express.static(path.join(__dirname, 'public')));

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
        objToArray: function (arr) {
            arr = arr.map(a => a.title);
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
    res.send('Hello world')
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
    if (lower.includes('show password for')) {
        let slackrequest = lower.split(' ')
        let website = slackrequest[4];
        bot.getUserById(message.user)
            .then((details) => {
                let slackemail = details.profile.email
                let member = []
                let slackrole
                
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
                        member.push({ "name": res.data.name, "email": res.data.email, "role": res.data.role})
    
                        slackrole = await RolePromise(member[0].role)
                        //console.log(slackrole)
                        // console.log("------------")
                        let passwords = await passwordSitePromise(website, slackrole);
                        // console.log(passwords)
                        if(passwords != null)
                        {

                            console.log("User role " +slackrole.title)
                            
                            console.log("assign role "+passwords.role);
                            //console.log(passwords.role.length)
                            
                            if (passwords.role[0] === slackrole.title || slackrole.title == "admin") {
                                //console.log(passwords.login+" "+passwords.username+" "+passwords.password)
                                bot.postMessage(message.user, `login url: ${passwords.login} \nusername: ${passwords.username} \npassword: ${passwords.password} `)
                            }
                            else if(passwords.role.length === 0){
                               bot.postMessage(message.user, 'You have no privilages.')
                            }
                            else {
                                // code
                            }
                        }
                        else
                            {bot.postMessage(message.user, 'This website is not in list.');}
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
    else {
        bot.postMessage(message.user, 'Please enter in this format, eg:"show password for <website>" ')
    }
}

//server is listening
app.listen(PORT, () => {
    console.log('server is running')
})