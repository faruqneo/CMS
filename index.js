const express = require('express')
const exphbs = require('express-handlebars')
const mongoose = require('mongoose')
const session = require('express-session')
const bodyParser = require('body-parser')
const dotenv = require('dotenv').config()
const SlackBots = require('slackbots')
const axios = require('axios')
const expressValidator = require('express-validator')
const  _ = require("underscore")
const path = require('path')
const config = require('./config/database')
const passport = require('passport')
const cms = require('./router/cms')
//const PORT = process.env.PORT || 5000

//Init app
const app = express()

//connection code for mongodb
mongoose.connect(config.database, { useNewUrlParser: true });
let db = mongoose.connection;

//checking for connection
db.once('open', function(){
    console.log("connected with mongodb")
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

//setting public folder
app.use("/public", express.static(path.join(__dirname, 'public')));

//setting up view pages
app.engine('handlebars', exphbs({defaultLayout: 'main',
helpers:{
    // Function to do basic mathematical operation in handlebar
    math: function(lvalue, operator, rvalue) {lvalue = parseFloat(lvalue);
        rvalue = parseFloat(rvalue);
        return {
            "+": lvalue + rvalue,
            "-": lvalue - rvalue,
            "*": lvalue * rvalue,
            "/": lvalue / rvalue,
            "%": lvalue % rvalue
        }[operator];
    }
}}));

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

//express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//express validator
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;

        while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
        }
        return {
        param : formParam,
        msg   : msg,
        value : value
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
app.get('*', function(req, res, next){
    res.locals.user = req.user || null ;
    next();
})


//create a bot
const bot = new SlackBots({
    token: process.env.slack_bot_token,
    name: 'punto'
});

//bot start
bot.on('start', () => {
    bot.postMessageToChannel('general', 'Hii')
})
//error checking
bot.on('error', (err) => console.log(err))

//message checking
bot.on('message', (data) => {
    if(data.type !== 'message')
    {
        return;
    }
    if(data.text.startsWith('<@UG981U6LA>'))
        handleMessage(data)  

})

//message handling
function handleMessage(message)
{
    let str = message.text.split('<@UG981U6LA>')
    let lower = str[1].toLowerCase()
    bot.getUserById(message.user)
    .then((details) => {
        let slackemail = details.profile.email
        let member, slackrole
        let role = []

        //getting members list through API
        axios({
            method:'get',
            url:'http://localhost:3000/cms/members/name'
          })
            .then(function(response) {
            let data = [];
            for(let key in response.data)
                data.push({"name": response.data[key].name,"email": response.data[key].email,"role": response.data[key].role})
            //console.log(data)
            member = _.where(data, {email: slackemail})
            slackrole = member[0].role
            //console.log(slackrole)

            //getting password list through API for checking members roles
            axios({
                method:'get',
                url:'http://localhost:3000/cms/password/website'
              })
                .then(function(response) {
                //console.log(response.data)
                for(let j in response.data)
                {  
                    //console.log(response.data[j].role)
                    if(lower.includes('show password') && lower.includes(response.data[j].website))
                    {
                        // console.log(response.data[j].website)
                        let rolearray = response.data[j].role.split(",")
                       // console.log(rolearray)
                        for(let i in rolearray)
                        {   //checking roles either it is valid or admin
                            if(rolearray[i] == slackrole || slackrole == 'admin')
                            {
                                role.push({"website": response.data[j].website,"login": response.data[j].login, "username": response.data[j].username, "password": response.data[j].password})
                                console.log(rolearray[i]);
                                console.log(slackrole);
                                break;
                            }
                            else
                            {
                                bot.postMessage(message.user, 'You have no privilage.');
                                break;
                            }
                        }
                        break;
                    }
                    else
                        {
                            //console.log(lower)
                            bot.postMessage(message.user, "This is not right format");
                            //break;
                            
                        }
                }
                //console.log(role)
                bot.postMessage(message.user, "Login_Url: "+role[0].login+"\nUsername: "+role[0].username+"\nPassword: "+role[0].password)
                //role.pop()
              })
              .catch((err) => console.log(err))
          });
    })
    .catch(error => console.log(error))
}

//server is listening
app.listen(3000, () => {
    console.log('server is running')
})