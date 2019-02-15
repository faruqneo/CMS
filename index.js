const express = require('express')
const exphbs = require('express-handlebars')
const mongoose = require('mongoose')
const session = require('express-session')
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const path = require('path')
const config = require('./config/database')
const passport = require('passport')
const cms = require('./router/cms')

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
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
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

//server is listening
app.listen('3000', () => {
    console.log('server is running')
})