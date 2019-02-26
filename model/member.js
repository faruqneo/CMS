const mongoose = require('mongoose')
const Role = require('./role')
const moment = require('moment');

const MemberSchema = mongoose.Schema({
    name:{
        type: String,
        require: true
    },
    email:{
        type: String,
        require: true
    },
    role:{
        type: mongoose.Schema.Types.String,
        ref: Role
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

let Memeber = module.exports = mongoose.model('Members', MemberSchema)