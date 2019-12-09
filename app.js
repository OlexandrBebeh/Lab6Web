'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const hbs = require('express-handlebars');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const connectDB = require('./DB/Connection');
connectDB();
const Port = process.env.PORT || 3000;

//const objectId = require('mongodb').ObjectID;
//const MongoClient = require('mongodb').MongoClient;
app.use('/api/userModel', require('./API/User'));
app.use(express.json({ extended: false }));

app.engine(
    'hbs',
    hbs({
        extname: 'hbs',
        defaultLayout: 'default',
        layoutsDir: __dirname + '/views/',
    })
);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use('/views', (req, res) => {
    const filename = __dirname + '/views' + req.url;
    console.log(filename);
    res.sendFile(filename, null, (err) => {
        if (err) console.log(err);
    });
});

const ArticleSchema = new Schema(
    {
        name: { type: String, required: true },
        text: { type: String, required: true },
        date: { type: Date, required: true },
    },
    { versionKey: false }
);

const Articles = mongoose.model('articles', ArticleSchema);
app.get('/', (req, res) => {
    Articles.find({}, function(err, users) {
        res.render('main', { layout: 'default', articles: users });
    });
});

app.use('/articles/:id', (req, res) => {
    Articles.findById({ _id: req.params.id }, (err, result) => {
        if (err) console.log(err);
        res.render('article', { layout: 'default', article: result });
    });
});

const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.get('/post', urlencodedParser, (req, res) => {
    console.log('get post');
    res.sendFile(__dirname + '/views/post.html');
});
app.post('/post', urlencodedParser, function(req, res) {
    console.log('post post');
    if (!req.body) return res.sendStatus(400);
    console.log(req.body);
    Articles.create(
        { name: req.body.name, text: req.body.text, date: new Date() },
        (err, doc) => {
            if (err) return console.log(err);
            console.log('�������� ������ user', doc);
        }
    );
    res.sendFile(__dirname + '/views/post.html');
});

/*
app.post('/', (req, res) => {
    console.log('All articles');
    Articles.find({}).toArray(function(err, result) {
        if (err) throw err;
        result = result.map((elem) => {
            let news = '';
            let id = elem._id;
            delete elem._id;
            delete elem.text;
            for (const i in elem) {
                news += `\n<p>${elem[i]}</p>`;
            }
            return (
                '<div class="newsdiv"><a class="news" href="/article/' +
                id +
                '">' +
                news +
                '</a></div>'
            );
        });
        res.render('main', { layout: 'default', articles: result });
    });
});*/
app.listen(Port, () => console.log('server start'));
/*
app.get('/', (req, res) => {
    MongoClient.connect('mongodb://localhost:27017/', function(err, db) {
        if (err) {
            return console.log(err);
        }
        console.log('connected!');
        const dataBase = db.db('Publishing');
        const collection = dataBase.collection('articles');
        collection.find({}).toArray(function(err, result) {
            if (err) throw err;
            result = result.map((elem) => {
                let news = '';
                let id = elem._id;
                delete elem._id;
                delete elem.text;
                for (const i in elem) {
                    news += `\n<p>${elem[i]}</p>`;
                }
                return (
                    '<div class="newsdiv"><a class="news" href="/article/' +
                    id +
                    '">' +
                    news +
                    '</a></div>'
                );
            });
            res.render('main', { layout: 'default', articles: result });
            db.close();
        });
    });
});
*/
/*
app.use('/article/:id', (req, res) => {
    MongoClient.connect('mongodb://localhost:27017/', (err, db) => {
        if (err) {
            return console.log(err);
        }
        const dataBase = db.db('Publishing');
        const collection = dataBase.collection('articles');
        const id = new objectId(req.params.id);
        collection.findOne({ _id: id }, (err, doc) => {
            if (err) throw err;
            console.log(doc);
            res.render('article', {
                layout: 'default',
                name: doc.name,
                text: doc.text,
                date: doc.text,
            });
            db.close();
        });
    });
});
*/
