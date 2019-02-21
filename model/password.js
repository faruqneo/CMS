const mongoose = require('mongoose')
const Roles = require('./role')
const moment = require('moment');

const PasswordSchema = mongoose.Schema({
    website:{
        type: String,
        require: true
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
        type: Date,
        default: moment().format()
    },
    updatedAT:{
        type: Date,
        default: moment().format()
    }
})

let Password = module.exports = mongoose.model('Passwords', PasswordSchema)