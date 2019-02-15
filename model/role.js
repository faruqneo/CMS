const mongoose = require('mongoose')

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
        default: Date.now
    },
    updatedAT:{
        type: Date,
        default: Date.now
    }
});

let Role = module.exports = mongoose.model('Roles', RoleSchema)