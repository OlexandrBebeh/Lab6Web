const mongoose = require('mongoose');

const user = new mongoose.Schema({
    Nickname: {
        type: String
    },
    Password: {
        type:String
    }
})

module.exports = User = mongoose.model('user', user);