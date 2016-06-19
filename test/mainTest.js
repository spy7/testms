var expect = require("chai").expect;
var rewire = require("rewire");
var main = rewire("../main.js");

main.__get__('useDbTest')();

describe("Mongo", function() {
	var connect = main.__get__('connect');
	var insert = main.__get__('updateUser');
	var select = main.__get__('selectUser');
	var select = main.__get__('selectAllUsers');
	var user = { 'id': 'testId', 'firstName': 'Carlos', 'lastName': 'Souza' };
	it("Insert user", function() {
		connect(function(db, callback) {
			insert(db, user, function() {
				callback();
			});
		});
	});
	it("Select user", function() {
		connect(function(db, callback) {
			select(db, user.id, function(doc) {
				expect(doc).to.equal(user);
				callback();
			});
		});
	});
	it("Select invalid user", function() {
		connect(function(db, callback) {
			select(db, "invalidId", function(doc) {
				expect(doc).to.equal(null);
				callback();
			});
		});
	});
	it("Select all users", function() {
		var group = [];
		group.push(user);
		connect(function(db, callback) {
			select(db, function(doc) {
				expect(doc).to.equal(group);
				callback();
			});
		});
	});
});
