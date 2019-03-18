const mongoose = require('mongoose');
const Roles = require('./role');
const Members = require('./member');
const moment = require('moment');

const ProjectSchema = mongoose.Schema({
    name:{
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
    roles:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: Roles
    }],
    members:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: Members
    }],
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
    createdAt:{
        type: String,
        default: moment().format('MMMM Do YYYY, h:mm:ss a')
    },
    updatedAT:{
        type: String,
        default: moment().format('MMMM Do YYYY, h:mm:ss a')
    }    
});

let Project = module.exports = mongoose.model('Projects' , ProjectSchema);