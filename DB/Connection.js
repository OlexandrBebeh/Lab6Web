const mongoose = require('mongoose');

//const URI = 'mongodb+srv://OlexandrBebeh1:v@cluster0-ous9y.mongodb.net/TryArticles?retryWrites=true&w=majority';
const URI = 'localhost3000:mongodb://localhost:27017/'
const connectDB = async () => {
    await mongoose.connect(URI, { useUnifiedTopology: true, useNewUrlParser: true }, () => console.log('db conected'));
}

module.exports = connectDB;