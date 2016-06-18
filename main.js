var mongoClient = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var bodyParser = require('body-parser');
var express = require('express');
var assert = require('assert');
var http = require("http");
var request = require('request');
var url = 'mongodb://localhost:27017/testms';
var urlTest = 'mongodb://localhost:27017/testms0';
var testToken = "AQVYNFuX9by-Lu1N9iplqHFnnRFxjQSUAkY7yKSo9iEFafkiqcfTDEVsh-costjf5NsBPxsHnigtok-acDNuzu70-Q7beX9nqUcEnOtHR9qtX-gv_OpLvrkbk2qO0noHa_L1gA1NBYfpFFxwR5RusnwxyLxiTopFVrvmsKSyTPYnqT4RkxA"
var app = express();
var router = express.Router();
var makeRequest = require('request');

app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));
app.use(express.static(__dirname + '/public'));
app.use('/api', router);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('port', (process.env.PORT || 8081));

app.listen(app.get('port'), function() {
	console.log('Server is running on port', app.get('port'));
});

// Main website

app.get('/', function(request, response) {
	response.render('pages/index');
});

// Database

var useDbTest = function() {
	url = urlTest;
}

var connect = function(response) {
	mongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		response(db, function() {
			db.close();
		});
	});
}

var selectAllUsers = function(db, response) {
	var cursor = db.collection('testms').find();
	var result = [];
	cursor.each(function(err, doc) {
		assert.equal(err, null);
		if (doc != null)
			result.push(doc);
		else
			response(result);
	});
}

var selectUser = function(db, id, response) {
	db.collection('testms').findOne({'id': id}, function(err, doc) {
		assert.equal(err, null);
		response(doc);
	});
}

var updateUser = function(db, user, callback) {
	db.collection('testms').updateOne({'id': user.id}, user, {upsert: true}, function(err, result) {
		assert.equal(err, null);
		callback();
	});
}

// Linkedin

var urlLinkedin = function(user) {
	return "https://api.linkedin.com/v1/people/" + user + ":(id,first-name,last-name,picture-url,public-profile-url)";
}

var readJson = function (url, token, result) {
	var headers = { 'x-li-format' : 'json', 'Authorization': 'Bearer ' + token }
	request({url:url, headers:headers}, function(err, response, body) {
		assert.equal(null, err);
		var user = JSON.parse(body);
		connect(function(db, callback) {
			updateUser(db, user, callback);
		});
		result(user);
	});
}

// API

router.route('/v1/linkedin')
	.get(function (request, response) {
		readJson(urlLinkedin("~"), testToken, function(data) {
			response.json(data);
		});
	})
	
router.route('/v1/mongo')
	.get(function (request, response) {
		connect(function(db, callback) {
			selectAllUsers(db, function(data) {
				response.json(data);
				callback();
			});
		});
	})
	.post(function (request, response) {
		connect(function(db, callback) {
			updateUser(db, request.body, function(data) {
				response.json("{result: 'ok'}");
				callback();
			});
		});
	})

router.route('/v1/mongo/:id')
	.get(function (request, response) {
		connect(function(db, callback) {
			selectUser(db, request.params.id, function(data) {
				response.json(data);
				callback();
			});
		});
	})
