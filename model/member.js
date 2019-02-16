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
        type: Date,
        default: moment().format()
    },
    updatedAT:{
        type: Date,
        default: moment().format()
    }
})

let Memeber = module.exports = mongoose.model('Members', MemberSchema)