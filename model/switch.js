const mongoose = require('mongoose')
const moment = require('moment');

let SwitchSchema = mongoose.Schema({
    status:{
        type: Boolean,
        require: true
    },
    lastTime:{
        type: String,
        default: moment().format('MMMM Do YYYY, h:mm:ss a')
    }
});

let Switch1 = module.exports = mongoose.model('Switches', SwitchSchema)