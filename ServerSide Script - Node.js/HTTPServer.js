var http = require("http");
var fs = require('fs');
var requestInfo = require("./PathExtract");
var url = require("url");
var mysql = require("mysql");

http.createServer(function (request, response) {

    var pathname = requestInfo.getPath(request);
    console.log("Request for " + pathname + " received.");
    response.writeHead(200);
    if(pathname == "/Lighting.html") {
        html = fs.readFileSync("C:/Users/Mayank/Documents/USF/Green Homes - RA/Lighting.html");
		response.write(html);
    } 
	else if (pathname == "/Computer.html") {
        html = fs.readFileSync("C:/Users/Mayank/Documents/USF/Green Homes - RA/Computer.html");
        response.write(html);
    }
	else if (pathname == "/GreenHomes.html" || pathname == "/") {
        html = fs.readFileSync("C:/Users/Mayank/Documents/USF/Green Homes - RA/GreenHomes.html");
		response.write(html);
    }
	else if (pathname == "/Refrigerator.html") {
        html = fs.readFileSync("C:/Users/Mayank/Documents/USF/Green Homes - RA/Refrigerator.html");
		response.write(html);
    }
	else if (pathname == "/validateRefrigerator") {
		var params = url.parse(request.url,true).query;
		console.log(request.method);
		response.write(params.oldFridge);
		var con = mysql.createConnection({
		  host: "localhost",
		  user: "mthirani",
		  password: "#Rpgsmn421#",
		  database: "yap"
		});
		con.connect(function(err) {
		  if(err){
			console.log('Error connecting to Db');
			return;
		  }
		  console.log('Connection established');
		});
		con.end(function(err) {
		  console.log('Connection released');
		});
    }
	else if (pathname.indexOf(".jpg") > -1) {
		var img = "C:/Users/Mayank/Documents/USF/Green Homes - RA" + pathname;
        image = fs.readFileSync(img);
		response.write(image);
    }
	else {
        html = fs.readFileSync("C:/Users/Mayank/Documents/USF/Green Homes - RA/404Error.html");
		response.write(html);
		/*response.write('<!doctype html>\n<html lang="en">\n' + 
						'<meta charset="utf-8">\n<title>Page Not Found</title>' + 
						'<style type="text/css">img {text-align: center;}</style>' + 
						'<h3><center>404 Error. Requested Page is not found. Please check the address and try again.</center></h3>' +
						'\n\n');*/
	}
	response.end();
}).listen(8080);
console.log("Listening to server on 8080...");