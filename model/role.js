const mongoose = require('mongoose')

let RoleSchema = mongoose.Schema({
    title:{
        type: String,
        require: true
    },
    description:{
        type: String,
        require: true
    }
});

let Role = module.exports = mongoose.model('Roles', RoleSchema)