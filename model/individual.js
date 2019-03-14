const mongoose = require('mongoose');
const Member = require('./member')
const moment = require('moment');

const IndividualSchema = mongoose.Schema({
    project:{
        type: String,
        require: true
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
    member:{
        type: mongoose.Schema.Types.ObjectId,
        ref: Member
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

let Individual = module.exports = mongoose.model('Individuals', IndividualSchema);