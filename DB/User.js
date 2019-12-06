const mongoose = require('mongoose');

const user = mongoose.Schema({
    name: {
        type: String
    },
    text: {
        type: String
    }
    })