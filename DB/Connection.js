const mongoose = require('mongoose');

const URI = 'mongodb+srv://OlexandrBebeh1:JbEWKFT3AmwZCIhk@cluster0-ous9y.mongodb.net/test?retryWrites=true&w=majority';

const connectDB = async () => {
    await mongoose.connect(URI, { useUnifiedTopology: true, useNewUrlParser: true });
    console.log('db conected');
}

module.exports = connectDB;