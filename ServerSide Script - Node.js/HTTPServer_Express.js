var compPage = require("./ComputerPage");
var requestInfo = require("./PathExtract");
var demogPage = require("./Demographics");
var url = require("url");
var uuid = require('node-uuid');
var logger = require('./logger.js');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var log = logger.logger;
var genUniqueCode;
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.get('/', function (req, res) {
	genUniqueCode = uuid.v1().slice(0,8);
	log.trace("Request for / received.");
	res.sendFile('D:\\Java-program\\JavaScript_NodeJS\\Version3\\Localhost' + '\\GreenHomes.html');
});
app.get('/GreenHomes.html', function (req, res) {
	genUniqueCode = uuid.v1().slice(0,8);
	log.trace("Request for /GreenHomes.html received.");
	res.sendFile('D:\\Java-program\\JavaScript_NodeJS\\Version3\\Localhost' + '\\GreenHomes.html');
});
app.get('/Lighting.html', function (req, res) {
	log.trace("Request for /Lighting.html received.");
	res.sendFile('D:\\Java-program\\JavaScript_NodeJS\\Version3\\Localhost' + '\\Lighting.html');
});
app.get('/Refrigerator.html', function (req, res) {
	log.trace("Request for /Refrigerator.html received.");
    res.sendFile('D:\\Java-program\\JavaScript_NodeJS\\Version3\\Localhost' + '\\Refrigerator.html');
});
app.get('/Lighting_page2.html', function (req, res) {
	log.trace("Request for /Lighting_page2.html received.");
	res.sendFile('D:\\Java-program\\JavaScript_NodeJS\\Version3\\Localhost' + '\\Lighting_page2.html');
});
app.get('/Refrigerator_page2.html', function (req, res) {
	log.trace("Request for /Refrigerator_page2.html received.");
    res.sendFile('D:\\Java-program\\JavaScript_NodeJS\\Version3\\Localhost' + '\\Refrigerator_page2.html');
});
app.get('/Computer.html', function (req, res) {
	log.trace("Request for /Computer.html received.");
    res.sendFile('D:\\Java-program\\JavaScript_NodeJS\\Version3\\Localhost' + '\\Computer.html');
});
app.get('/DemographicsInfo.html', function (req, res) {
	log.trace("Request for /DemographicsInfo.html received.");
    res.sendFile('D:\\Java-program\\JavaScript_NodeJS\\Version3\\Localhost' + '\\DemographicsInfo.html');
});
app.post('/submitLighting', urlencodedParser, function (req, res) {
	log.trace("Request for /submitLighting received.");
	res.redirect('/Lighting_page2.html');
});
app.post('/submitRefrigerator', urlencodedParser, function (req, res) {
	log.trace("Request for /submitRefrigerator received.");
	res.redirect('/Refrigerator_page2.html');
});
app.post('/submitComputer', urlencodedParser, function (req, res) {
	var endComputerPage = compPage.generateEndCompPage(req);
	log.trace("Request for /submitComputer received.");
	if(!(endComputerPage == "Error"))
	{
		res.send(endComputerPage);
	}
	else
	{
		log.error("ErrorPage for /submitComputer received for UniqueCode: " + genUniqueCode);
		res.sendFile('D:\\Java-program\\JavaScript_NodeJS\\Version3\\Localhost' + '\\404Error.html');
	}
});
app.post('/submitDemographics', urlencodedParser, function (req, res) {
	var demographicsInfo = demogPage.updateDemographics(req);
	log.trace("Request for /submitDemographics received.");
	if(demographicsInfo == "OK")
	{
		var endSurveyPage = generateEndPage(genUniqueCode);
		res.send(endSurveyPage);
	}
	else
	{
		log.error("ErrorPage for /submitDemographics received for UniqueCode: " + genUniqueCode);
		res.sendFile('D:\\Java-program\\JavaScript_NodeJS\\Version3\\Localhost' + '\\404Error.html');
	}
});
app.post('/completeRefrigerator', urlencodedParser, function (req, res) {
	log.trace("Request for /completeRefrigerator received.");
	res.redirect('/Lighting.html');
});
app.post('/completeLighting', urlencodedParser, function (req, res) {
	log.trace("Request for /completeLighting received.");
	res.redirect('/Computer.html');
});
app.post('/completeComputer', urlencodedParser, function (req, res) {
	var updateComputer = compPage.updateCompSettings(req);
	log.trace("Request for /completeComputer received.");
	if(updateComputer == "OK")
		res.redirect('/DemographicsInfo.html');
	else
	{
		log.error("ErrorPage for /completeComputer received for UniqueCode: " + genUniqueCode);
		res.sendFile('D:\\Java-program\\JavaScript_NodeJS\\Version3\\Localhost' + '\\404Error.html');
	}
});
app.get('*.jpg', function (req, res) {
	var pathname = requestInfo.getPath(req);
	var img = "D:\\Java-program\\JavaScript_NodeJS\\Version3\\Localhost" + pathname;
	if(pathname.indexOf("404Error.jpg") > -1)
	{
		img = "D:\\Java-program\\JavaScript_NodeJS\\Version3\\Localhost\\404Error.jpg"
	}
	log.trace("Request for " + pathname + " received for UniqueCode: " + genUniqueCode);
	res.sendFile(img);
});
app.get('/*', function (req, res) {
	var pathname = requestInfo.getPath(req);
	log.error("Request for " + pathname + " received for UniqueCode: " + genUniqueCode);
	res.sendFile('D:\\Java-program\\JavaScript_NodeJS\\Version3\\Localhost' + '\\404Error.html');
});
var server = app.listen(8080, function () {
  var host = server.address().address;
  var port = server.address().port;

  log.trace("HTTP server started for the project GreenHomes; istening on port 8080");
});
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
