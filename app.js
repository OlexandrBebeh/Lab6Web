'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const hbs = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

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

app.get('/chat', (req, res) => {
  res.render('chat', { layout: 'default',registration:false });
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

const UserSchema = new Schema(
    {
        username: { type: String, required: true, unique:true },
        password: { type: String, required: true },
    },
    { versionKey: false }
);

const Users = mongoose.model('Users', UserSchema);

app.get('/enter',urlencodedParser, (req, res) => {
    res.render('enter',{ layout: 'default', error: false});
});

app.post('/enter', urlencodedParser, function(req, res) {
    if (!req.body) return res.sendStatus(400);
    const password = req.body.password;
    Users.findOne({username:req.body.username},(err,doc)=>{
      if(err) console.log(err);
      if(password === doc.password){
        res.render('chat',{ layout: 'default', username:doc.username, registration:true});
      }
      else{
        res.render('enter',{ layout: 'default', error: true});
      }
    });
});
app.get('/regis',urlencodedParser, (req, res) => {
    res.render('regis',{ layout: 'default', error: false});
});
app.post('/regis',urlencodedParser, (req, res) => {
  if (!req.body) return res.sendStatus(400);
    Users.create({username:req.body.username,password:req.body.password});
    res.render('chat',{ layout: 'default', username: req.body.username, registration:true});
});
const connections = [];

const MessgesSchema = new Schema(
    {
        user: { type: String, required: true },
        text: { type: String, required: true },
        date: { type: Date, required: true },
    },
    { versionKey: false }
);
const Messeges = mongoose.model('Messeges', MessgesSchema);

io.on('connection', socket => {
  console.log('new connection' + socket);
  connections.push(socket);
  socket.on('load history', ()=>{
    
      Messeges.find({}).then(result=>{
        let doc = [];
        for (var i = result.length - 1, j=0; i >= result.length - 10; i--) {
          doc[j] = {
            user:result[i].user,
            text: result[i].text,
            date:result[i].date
          }
          j++;
        }

        io.sockets.emit('history',doc);
      });
      
  });
socket.on('load full history', ()=>{
    
      Messeges.find({}).then(result=>{
        let doc = [];
        for (var i = result.length - 1, j=0; i >= 0; i--) {
          doc[j] = {
            user:result[i].user,
            text: result[i].text,
            date:result[i].date
          }
          j++;
        }

        io.sockets.emit('full history',doc);
      });
      
  });
  socket.on('disconnect', () => {
    const index = connections.indexOf(socket);
    io.sockets.emit('users loaded', '{ users }');
  });

  socket.on('send message', (message, user, date) => {
    console.log('send message:', message, user);
       Messeges.create({user:user, text:message, date: date});
        io.sockets.emit('message', message, user, date);
  });

  socket.on('new user', ()=>{

  });
});



server.listen('3000', () => {
  console.log('Server listening on Port 3000');
});


// app.listen(Port, () => console.log('server start'));


















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
