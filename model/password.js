const mongoose = require('mongoose')
const Roles = require('./role')
const moment = require('moment');

const PasswordSchema = mongoose.Schema({
    website:{
        type: String,
        require: true,
        unique: true
    },
    login: {
        type: String,
        require: true
    },
    role:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: Roles
    }],
    username:{
        type: String,
        require: true
    },
    password:{
        type: String,
        require: true
    },
    createdAt:{
        type: String,
        default: moment().format('MMMM Do YYYY, h:mm:ss a')
    },
    updatedAT:{
        type: String,
        default: moment().format('MMMM Do YYYY, h:mm:ss a')
    }
})

let Password = module.exports = mongoose.model('Passwords', PasswordSchema)