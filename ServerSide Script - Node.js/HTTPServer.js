var http = require("http");
var fs = require('fs');
var requestInfo = require("./PathExtract");
var compPage = require("./ComputerPage");
var demogPage = require("./Demographics");
var url = require("url");
var uuid = require('node-uuid');
var logger = require('./logger.js');
var log = logger.logger;
var genUniqueCode;
var endComputerPage;

http.createServer(function (request, response) {
	
    var pathname = requestInfo.getPath(request);
    log.trace("Request for " + pathname + " received.");
    if(pathname == "/Lighting.html") {
        html = fs.readFileSync("./Lighting.html");
		response.writeHead(200);
		response.write(html);
    }
	else if (pathname == "/Lighting_page2.html") {
        html = fs.readFileSync("./Lighting_page2.html");
		response.writeHead(200);
        response.write(html);
    }
	else if (pathname == "/Computer.html") {
        html = fs.readFileSync("./Computer.html");
		response.writeHead(200);
        response.write(html);
    }
	else if (pathname == "/Computer_page2") {
		response.writeHead(200);
		response.write(endComputerPage);
    }
	else if (pathname == "/GreenHomes.html" || pathname == "/") {
        html = fs.readFileSync("./GreenHomes.html");
		genUniqueCode = uuid.v1().slice(0,8);
		response.writeHead(200);
		response.write(html);
    }
	else if (pathname == "/Refrigerator.html") {
        html = fs.readFileSync("./Refrigerator.html");
		response.writeHead(200);
		response.write(html);
    }
	else if (pathname == "/Refrigerator_page2.html") {
        html = fs.readFileSync("./Refrigerator_page2.html");
		response.writeHead(200);
		response.write(html);
    }
	else if (pathname == "/DemographicsInfo.html") {
        html = fs.readFileSync("./DemographicsInfo.html");
		response.writeHead(200);
		response.write(html);
    }
	else if (pathname == "/submitRefrigerator") {
		response.writeHead(301,{Location: '/Refrigerator_page2.html'});
    }
	else if (pathname == "/completeRefrigerator") {
		response.writeHead(301,{Location: '/Lighting.html'});
    }
	else if (pathname == "/submitLighting") {
		response.writeHead(301,{Location: '/Lighting_page2.html'});
    }
	else if (pathname == "/completeLighting") {
		response.writeHead(301,{Location: '/Computer.html'});
    }
	else if (pathname == "/EndSurvey") {
		var endSurveyPage = generateEndPage(genUniqueCode);
		response.writeHead(200);
		response.write(endSurveyPage);
    }
	else if (pathname == "/submitComputer") {
		endComputerPage = compPage.generateEndCompPage(request);
		if(!(endComputerPage == "Error"))
			response.writeHead(301,{Location: '/Computer_page2'});
		else
		{
			html = fs.readFileSync("./404Error.html");
			response.writeHead(404);
			response.write(html);
		}
    }
	else if (pathname == "/completeComputer") {
		var updateComputer = compPage.updateCompSettings(request);
		if(updateComputer == "OK")
			response.writeHead(301,{Location: '/DemographicsInfo.html'});
		else
		{
			html = fs.readFileSync("./404Error.html");
			response.writeHead(404);
			response.write(html);
		}
    }
	else if (pathname == "/submitDemographics") {
		var demographicsInfo = demogPage.updateDemographics(request);
		if(demographicsInfo == "OK")
			response.writeHead(301,{Location: '/EndSurvey'});
		else
		{
			html = fs.readFileSync("./404Error.html");
			response.writeHead(404);
			response.write(html);
		}
    }
	else if (pathname.indexOf(".jpg") > -1) {
		var img = "." + pathname;
		if(pathname.indexOf("404Error.jpg") > -1)
		{
			img = "./404Error.jpg"
		}
        image = fs.readFileSync(img);
		response.writeHead(200);
		response.write(image);
    }
	else {
        html = fs.readFileSync("./404Error.html");
		response.writeHead(404);
		response.write(html);
	}
	response.end();
}).listen(8081);
log.trace("HTTP server started for the project GreenHomes; istening on port 8081");

function uniqueCode()
{
	return genUniqueCode;
}
exports.uniqueCode = uniqueCode;

function generateEndPage(genUniqueCode)
{
	if(typeof genUniqueCode == "undefined")
	{
		var body = '<!DOCTYPE html><html lang="en"><head><title>Thank you!</title><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css"><script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script><script src="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script><style>.parent {display: flex;height: 150px;}.child {width: 70px; height: 70px;margin: auto;}</style></head><body><div class="well"><div class="container"></br></br><div class="alert alert-danger"><h5>We could not record your response as it seems that you have invoke multiple/ invalid session for submitting the survey. </h5><h5>Thus, we could not generate the Unique Code to receive the credit for taking this survey. Please try to avoid multiple/ invalid session and try again for submitting the survey.</h5></div><div class="container"><h3></h3></div></div></body></html>';
	}
	else
	{
		var body = '<!DOCTYPE html><html lang="en"><head><title>Thank you!</title><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css"><script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script><script src="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script><style>.parent {display: flex;height: 150px;}.child {width: 70px; height: 70px;margin: auto;}</style></head><body><div class="well"><div class="container"></br></br><h4>Thank you for taking the time to participate in this important survey to evaluate the goals and recommendations most effective to help residential users reduce their energy consumption! We have recorded your response successfully <span class="glyphicon glyphicon-thumbs-up"></span></h4><div class="parent"><img src="ok.jpg" class="child" width="50" height="50"/></div><h4 style="text-align: center">Your Unique Code is: <font color="ForestGreen">' + genUniqueCode + '</font></h4><h4 style="text-align: center">Please make a note of the Unique Code generated above to receive the credit for taking this survey.</h4></div><div class="container"><h3><br/></h3></div></div></body></html>';
	}
	
	return body;
}
	
