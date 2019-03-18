const mongoose = require('mongoose');
const Roles = require('./role');
const Members = require('./member');
const moment = require('moment');

const WebsiteSchema = mongoose.Schema({
    name:{
        type: String,
        require: true,
        unique: true
    },
    login: {
        type: String,
        require: true
    },
    roles:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: Roles
    }],
    members:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: Members
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
});

let Website = module.exports = mongoose.model('Website' , WebsiteSchema);