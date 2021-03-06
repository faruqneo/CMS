const mongoose = require('mongoose')
const Roles = require('./role')
const moment = require('moment');

const PasswordSchema = mongoose.Schema({
    project:{
        type: String,
        require: true,
        unique: true
    },
    branch:{
        type: String,
        require: true,        
    },
    bitbucket_link: {
        type: String,
        require: true
    },
    client_name:{
        type: String,
        require: true        
    },
    manager:{
        type: String,
        require: true        
    },
    domains:{
        type: String,
        require: true        
    },
    ec2:{
        type: String,
        require: true        
    },
    pem:{
        type: String,
        require: true         
    },
    role:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: Roles
    }],
    createdAt:{
        type: String,
        default: moment().format('MMMM Do YYYY, h:mm:ss a')
    },
    updatedAT:{
        type: String,
        default: moment().format('MMMM Do YYYY, h:mm:ss a')
    }
})

let Password = module.exports = mongoose.model('Passwords', PasswordSchema);