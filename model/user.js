const mongoose = require('mongoose')

let UserShema = mongoose.Schema({
    username:{
        type: String,
        require: true,
        unique: true
    },
    password:{
        type: String,
        require: true
    }
});

let User = module.exports = mongoose.model('Users', UserShema)