const mongoose = require('mongoose')

let SwitchShema = mongoose.Schema({
    status:{
        type: Boolean,
        require: true
    }
});

let Switch = module.exports = mongoose.model('Switches', SwitchShema)