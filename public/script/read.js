var readJson = function (url, result) {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4)
			if (xmlhttp.status == 200)
				result(JSON.parse(xmlhttp.responseText));
			else
				result(JSON.parse("{\"result\":\"error\", \"message\":\"reading error\"}"));
	}
	xmlhttp.open('get', url, true);
	xmlhttp.send();
}

var hasError = function (json) {
	return !json || (json.result && (json.result == "error" || json.result == "invalid"));
}

var fillData = function(data) {
	if (!hasError(data)) {
		document.getElementById('fsName').innerHTML = data.firstName;
		document.getElementById('lsName').innerHTML = data.lastName;
		document.getElementById('urlProfile').href = data.publicProfileUrl;
		document.getElementById('urlProfile').innerHTML = data.publicProfileUrl;
		document.getElementById('picture').src = data.pictureUrl;
	}
	else
		document.getElementById('lnData').innerHTML = "Error";
}

var readLn = function() {
	readJson('/api/v1/linkedin', function(data) {
		readDb();
		fillData(data);
	});
}

var readDb = function() {
	readJson('/api/v1/mongo', function(data) {
		if (!hasError(data)) {
			var text = "";
			for (var user of data)
				text += "<div><a href='#' onclick='readDbUser(\"" + user.id + "\");'>" + user.firstName + " " + user.lastName + "</a></div>";
			document.getElementById('history').innerHTML = text;
		}
		else
			document.getElementById('history').innerHTML = "DB error";
	});
}

var readDbUser = function(id) {
	readJson('/api/v1/mongo/' + id, fillData);
}