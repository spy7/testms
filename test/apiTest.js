var expect = require("chai").expect;
var supertest = require("supertest");
var server = supertest.agent("http://localhost:8081");

describe("API", function(){
	it("Check home page", function(done){
		server
		.get("/")
		.expect(200)
		.end(function(err, res){
			expect(err).to.equal(null);
			expect(res.status).to.equal(200);
			done();
		});
	});
	it("API LinkedIn", function(done){
		server
		.get("/api/v1/linkedin")
		.expect(200).expect("Content-type", /json/)
		.end(function(err, res){
			expect(res.body.lastName).to.equal("Sanches de Souza");
			done();
		});
	});
	it("API Mongo", function(done){
		server
		.get("/api/v1/mongo/JSJBMqSvoZ")
		.expect(200).expect("Content-type", /json/)
		.end(function(err, res){
			expect(res.body.lastName).to.equal("Sanches de Souza");
			done();
		});
	});
});