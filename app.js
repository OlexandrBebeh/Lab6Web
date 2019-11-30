var express = require('express');
const hbs = require('express-handlebars');
const path = require('path');
var app = express();

const MongoClient = require("mongodb").MongoClient;

// view render engine setup
app.engine('hbs', hbs({ extname: 'hbs', defaultLayout: 'default',
  layoutsDir: __dirname + '/views/' }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.get('/', (req, res) => {
	MongoClient.connect("mongodb://localhost:27017/", function(err, db){
	    if(err){
	        return console.log(err);
	    }
	    console.log('connected!');
	    const dataBase = db.db("Publishing");
	    const collection = dataBase.collection('articles');
	    collection.find({}).toArray(function(err, result) {
	    if (err) throw err;
	    console.log(result);
	    result = result.map(elem => {
	    	let news = '';
	    	delete elem._id;
	    	delete elem.text;
	    	for (const i in elem) {
	    		news += `\n<p>${elem[i]}</p>`;
	    	}
	    	return '<div class="newsdiv"><a class="news" href="#">' + news + '</a></div>';
	    });
		res.render('main', { layout: 'default', articles: result });
	    db.close();
	  });
	});
});

app.use('/views', (req, res) => {
	const filename = __dirname + '/views' + req.url;
	console.log(filename);
	res.sendFile(filename, null, err => {
		if (err)
			console.log(err);
	});
});

app.listen(3000);
