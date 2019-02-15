const mongoose = require('mongoose')
const Roles = require('./role')

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
    }
})

let Password = module.exports = mongoose.model('Passwords', PasswordSchema)