const mongoose = require('mongoose')
const moment = require('moment');

let RoleSchema = mongoose.Schema({
    title:{
        type: String,
        require: true
    },
    description:{
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
});

let Role = module.exports = mongoose.model('Roles', RoleSchema)