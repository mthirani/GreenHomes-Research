var http = require("http");
var fs = require('fs');
var url = require("url");
var mysql = require("mysql");
var compPage = require("./HTTPServer_Express.js");
var logger = require('./logger.js');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var log = logger.logger;

function updateDemographics(request)
{
	var UniqueCode = compPage.uniqueCode();
	var Age = request.body.age;
	var Gender = "";
	if(request.body.GenderMale == "GenderMale")
		Gender = "Male";
	if (request.body.GenderFemale == "GenderFemale")
		Gender = "Female";
	if (request.body.GenderOther == "GenderOther")
		Gender = "Other";
	var Education = request.body.education;
	var Race = request.body.race;
	var Live = request.body.live;
	var Income = request.body.income;
	var Housestats = request.body.housestats;
	var Placeoflive = request.body.placeoflive;
	var NumberPeople = request.body.numberPeople;
	var Typeofhome = request.body.typeofhome;
	var HouseSize = request.body.largeHouse;
	var OldHouse = request.body.oldHouse;
	var HeatingSystem = request.body.heatingSystem;
	var BillSummer = request.body.billSummer;
	var BillWinter = request.body.billWinter;
	var queryString = 'INSERT INTO Demographics (UniqueCode,Age,Gender,Education,Race,Live,Income,Housestats,Placeoflive,NumberPeople,Typeofhome,HouseSize,OldHouse,HeatingSystem,BillSummer,BillWinter) VALUES("'+ UniqueCode + '", "' + Age + '", "' + Gender + '", "' + Education + '", "' + Race + '", "' + Live + '", "' + Income + '", "' + Housestats + '", "' + Placeoflive + '", ' + NumberPeople + ', "' + Typeofhome + '", "' + HouseSize + '", "' + OldHouse + '", "' + HeatingSystem + '", "' + BillSummer + '", "' + BillWinter + '");';
	var con = mysql.createConnection({
		  host: "localhost",
		  user: "mthirani",
		  password: "#Rpgsmn421#",
		  database: "GreenHomes"
		});
	var indicator = 0;
	con.connect(function(err) 
	{
	  if(err)
	  {
		log.error("Error while connecting to Db in function: updateDemographics for UniqueCode: " + UniqueCode);
		//throw err;
	  }
	});
	con.query(queryString, function(err, result) 
	{
	  if(err)
	  	log.error("Error in INSERT while storing demographics informations to Db in function: updateDemographics for UniqueCode: " + UniqueCode);
	  else
		log.trace("Demographics Information has been stored in Db for UniqueCode: " + UniqueCode);
	  con.end();
	});
	
	return "OK";
}
exports.updateDemographics = updateDemographics;