/** 
 * @fileoverview This is the main file for the project Mean Stack
 *
 * @author Carlos André Sanches de Souza cas_souza@yahoo.com
 * @version 0.1
 */

/** Initialize variables */
var mongoClient = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var bodyParser = require('body-parser');
var express = require('express');
var assert = require('assert');
var http = require("http");
var request = require('request');
var swaggerJSDoc = require('swagger-jsdoc');
var url = 'mongodb://localhost:27017/testms';
var urlTest = 'mongodb://localhost:27017/testms0';
var urlLinkedin = "https://api.linkedin.com/v1/people/~:(id,first-name,last-name,picture-url,public-profile-url)";
var testToken = "AQVYNFuX9by-Lu1N9iplqHFnnRFxjQSUAkY7yKSo9iEFafkiqcfTDEVsh-costjf5NsBPxsHnigtok-acDNuzu70-Q7beX9nqUcEnOtHR9qtX-gv_OpLvrkbk2qO0noHa_L1gA1NBYfpFFxwR5RusnwxyLxiTopFVrvmsKSyTPYnqT4RkxA"
var app = express();
var router = express.Router();
var makeRequest = require('request');
var swaggerDefinition = { info: { title: 'TestMS API', version: '0.1', description: 'Test Mean Stack API' }, host: 'localhost:8081', basePath: '/' };
var swaggerSpec = swaggerJSDoc({ swaggerDefinition: swaggerDefinition, apis: ['./*.js'] });

/** Configure app server */
app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));
app.use(express.static(__dirname + '/public'));
app.use('/api', router);
app.get('/swagger.json', function(req, res) { res.setHeader('Content-Type', 'application/json'); res.send(swaggerSpec); });
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('port', (process.env.PORT || 8081));

/** Start server at port 8081 */
app.listen(app.get('port'), function() {
	console.log('Server is running on port', app.get('port'));
});

/** Configure main page */
app.get('/', function(request, response) {
	response.render('pages/index');
});

/** Configure database as test */
var useDbTest = function() {
	url = urlTest;
}

/**
 * Callback for close connection
 * @callback connectClose
 */
/**
 * Callback for connection response
 * @callback connectResponse
 * @param {Object} db - the connected database
 * @param {connectClose} callback - callback used to close connection
 */
/**
 * Create a connection to database
 * @param {connectResponse} response - callback with the connection response
 */
var connect = function(response) {
	mongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		response(db, function() {
			db.close();
		});
	});
}

/**
 * Callback with the data read
 * @callback selectResponse
 * @param {Object} data - data read
 */
/**
 * Get all users from database
 * @param {Object} db - connected database
 * @param {selectResponse} response - callback with the data read from database
 */
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

/**
 * Get one user from database
 * @param {Object} db - connected database
 * @param {string} id - the id from user
 * @param {selectResponse} response - callback with the data read from database
 */
var selectUser = function(db, id, response) {
	db.collection('testms').findOne({'id': id}, function(err, doc) {
		assert.equal(err, null);
		response(doc);
	});
}

/**
 * Callback from update
 * @callback updateResponse
 */
/**
 * Insert or update an user at database
 * @param {Object} db - connected database
 * @param {Object} user - the user data to update
 * @param {updateResponse} callback - callback from update
 */
var updateUser = function(db, user, callback) {
	db.collection('testms').updateOne({'id': user.id}, user, {upsert: true}, function(err, result) {
		assert.equal(err, null);
		callback();
	});
}

/**
 * Read JSON data from url
 * @param {string} url - url to read data
 * @param {string} token - linkedin token
 * @param {selectResponse} result - callback with data from url
 */
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

/**
 * Route for API linkedin
 */ 

 /**
 * @swagger
 * definition:
 *   UserData:
 *     properties:
 *       id:
 *         type: string
 *       firstName:
 *         type: string
 *       lastName:
 *         type: string
 *       pictureUrl:
 *         type: string
 *       publicProfileUrl:
 *         type: string
 */
 /**
 * @swagger
 * /api/v1/linkedin:
 *   get:
 *     tags:
 *       - LinkedIn
 *     description: Returns LinkedIn data from author
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: LinkedIn data from author
 *         schema:
 *           $ref: '#/definitions/UserData'
 */
router.route('/v1/linkedin')
	.get(function (request, response) {
		readJson(urlLinkedin, testToken, function(data) {
			response.json(data);
		});
	})

/**
 * @swagger
 * /api/v1/mongo:
 *   get:
 *     tags:
 *       - Mongo
 *     description: Returns data from all users from database
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Data from all users from database
 *         schema:
 *           $ref: '#/definitions/UserData'
 *   post:
 *     tags:
 *       - Mongo
 *     description: Insert a user to database
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user
 *         description: user data
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/UserData'
 *     responses:
 *       200:
 *         description: Successfully created
 */
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

/**
 * @swagger
 * /api/v1/mongo/{id}:
 *   get:
 *     tags:
 *       - Mongo
 *     description: Returns a single user from database
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: User's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A single user from database
 *         schema:
 *           $ref: '#/definitions/UserData'
 */
router.route('/v1/mongo/:id')
	.get(function (request, response) {
		connect(function(db, callback) {
			selectUser(db, request.params.id, function(data) {
				response.json(data);
				callback();
			});
		});
	})
