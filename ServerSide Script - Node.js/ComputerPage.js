var http = require("http");
var fs = require('fs');
var url = require("url");
var mysql = require("mysql");
var compPage = require("./HTTPServer_Express.js");
var logger = require('./logger.js');
var bodyParser = require('body-parser');
var log = logger.logger;
var express = require('express');
var app = express();

function computeComputerSavings(request)
{
	var UniqueCode = compPage.uniqueCode();
	var AgeComputer = "";
	var DeviceType = "";
	var Monitor = "";
	var AgeMonitor = "";
	var EnergyRated = "No";
	var UsageType = "";
	var MonthlyUsage = 0;
	var DailyUsage = 0;
	var ScreenSaver = "";
	var SetAfterWork = "ShutDown";
	var MultipleApps = "No";
	var RequireMultipleApps = "";
	var savePowerKwH = 0.0;
	var estimatedPowerKwH = 0.0;
	var savings = '$(QuestionsFiltering).fadeIn(1);$(PCOffFiltering).fadeIn(1);$(MonitorFiltering).fadeIn(1);$(ScreenSaverFiltering).fadeIn(1);$(ApplicationsFiltering).fadeIn(1);$(EnergyRatedFiltering).fadeIn(1);';
	var power = 0;
	var additionalPower = 0;
	var usagePower = 0;
	var estimatedPower = 0;
	var savePower = 0;
	var calcHoursUsage = 0;
	AgeComputer = request.body.OldComputer;
	if(request.body.Desktop == "Desktop")
	{
		DeviceType = "Desktop";
		power = 200;
		Monitor = request.body.Monitor;
		AgeMonitor = request.body.OldMonitor;
		if(request.body.Monitor == "CRT")
			additionalPower = 80;
		else if(request.body.Monitor == "LCD")
			additionalPower = 40;
		else
			additionalPower = 20;
	}
	if(request.body.Laptop == "Laptop")
	{
		DeviceType = "Laptop";
		power = 40;
	}
	if(request.body.EnergyStarYes == "Yes")
	{
		power = 0.5*power;
		EnergyRated = "Yes";
	}
	UsageType = request.body.PCUsageType;
	if(request.body.PCUsageType == "Workstation")
		usagePower = power + 0.4*power;
	else if(request.body.PCUsageType == "Browsing")
		usagePower = power + 0.7*power;
	else
		usagePower = power + 1.0*power;
	
	if(request.body.EnergyStarYes == "Yes")
		savePower = usagePower;
	else
		savePower = 0.5*usagePower;
	
	if(request.body.Multiple == "Multiple")
	{
		MultipleApps = "Yes";
		usagePower = usagePower + 0.3*usagePower;
		RequireMultipleApps = request.body.appsrunning;
		if(request.body.appsrunning == "Yes")
		{
			savePower = savePower + 0.3*savePower;
		}
	}
	MonthlyUsage = request.body.PCUsageMonths;
	DailyUsage = request.body.PCUsageDaily;
	ScreenSaver = request.body.ScreenSaver;
	usagePower = usagePower + additionalPower;
	savePower = savePower + additionalPower;		
	calcHoursUsage = (request.body.PCUsageMonths)*(request.body.PCUsageDaily);
	var extraPower = 0;
	var extraHoursUsage = 0;
	var saveAdditionalPower = 0;
	var consumedKWH = 0.0;
	var estimatedKWH = 0.0;
	if(!(request.body.ShutDown == "ShutDown"))
	{
		if(request.body.EnergyStarYes == "Yes")
			saveAdditionalPower = power;
		else
			saveAdditionalPower = 0.5*power;
		saveAdditionalPower = saveAdditionalPower - 0.75*saveAdditionalPower;
		extraHoursUsage = 31*24 - calcHoursUsage;
		if(request.body.Sleep == "Sleep")
		{
			extraPower = power - 0.75*power;
			SetAfterWork = "Sleep";
		}
		else if(request.body.Running == "Running" && (request.body.ScreenSaver == "Yes"))
		{
			extraPower = power + 0.4*power;
			SetAfterWork = "PC Running";
		}
		else if(request.body.Running == "Running" && (request.body.ScreenSaver == "No"))
		{
			extraPower = power;
			SetAfterWork = "PC Running";
		}
		else if(request.body.RunDisplay == "RunDisplay" && (request.body.ScreenSaver == "Yes"))
		{
			extraPower = power + 0.4*power + additionalPower;
			SetAfterWork = "PC & Monitor Running";
		}
		else
			extraPower = power + additionalPower;
	}
	consumedKwH = ((usagePower*calcHoursUsage) + (extraPower*extraHoursUsage))/1000;
	estimatedKwH = ((savePower*calcHoursUsage) + (saveAdditionalPower*extraHoursUsage))/1000;
	consumedKwH = consumedKwH.toFixed(2);
	estimatedKwH = estimatedKwH.toFixed(2);
	saveKwH = consumedKwH - estimatedKwH;
	saveKwH = saveKwH.toFixed(2);
	estimatedPowerKwH = estimatedKwH;
	savePowerKwH = saveKwH;
	if(consumedKwH == estimatedKwH)
		savings = savings + '$(estimate).html("Your estimated and consumed units are ' + consumedKwH + 'Kwh. You have set your computer to an optimized level.");';
	else
	{
		savings = savings + '$(estimate).html("Your estimated consumption is ' + consumedKwH + 'Kwh. You can save around ' + saveKwH + 'Kwh units. Trying the listed below recommendations might save your electricity: ");';
		savings = savings + '$(QuestionsFiltering).fadeIn(1);';
	}
	var count = 1;
	if((request.body.EnergyStarNo == "No" || request.body.EnergyStarNotKnow == "Do Not Know") && (saveKwH > 0))
	{
		savings = savings + '$(estimate).append("<h5>' + count + '. Use ENERGY STAR rated PCs.</h5>");';
		savings = savings + '$(EnergyRatedFiltering).fadeIn(1);';
		count = count + 1;
	}
	if(request.body.ScreenSaver == "Yes" && (saveKwH > 0) && !(request.body.Sleep == "Sleep") && !(request.body.ShutDown == "ShutDown"))
	{
		savings = savings + '$(estimate).append("<h5>' + count + '. Do not use screen savers - just dim or turn off the monitor when not in use.</h5>");';
		savings = savings + '$(ScreenSaverFiltering).fadeIn(1);';
		count = count + 1;
	}
	if(request.body.Multiple == "Multiple" && request.body.appsrunning == "No" && (saveKwH > 0))
	{
		savings = savings + '$(estimate).append("<h5>' + count + '. Close applications not currently in use while using your computer.</h5>");';
		savings = savings + '$(ApplicationsFiltering).fadeIn(1);';
		count = count + 1;
	}
	if(!(request.body.Sleep == "Sleep") && !(request.body.ShutDown == "ShutDown") && (saveKwH > 0))
	{
		savings = savings + '$(estimate).append("<h5>' + count + '. Use the power management features of your operating system to put your computer to sleep.</h5>");';
		count = count + 1;
	}
	if((request.body.RunDisplay == "RunDisplay" || request.body.Running == "Running") && (saveKwH > 0) && (request.body.Laptop == "Laptop"))
	{
		savings = savings + '$(estimate).append("<h5>' + count + '. Turn off the monitor and PC if you are not going to use the PC for 2 hours.</h5>");';
		savings = savings + '$(PCOffFiltering).fadeIn(1);';
		count = count + 1;
	}
	if((request.body.Running == "Running") && (saveKwH > 0) && (request.body.Desktop == "Desktop"))
	{
		savings = savings + '$(estimate).append("<h5>' + count + '. Turn off the PC if you are not going to use the PC for 20 minutes.</h5>");';
		savings = savings + '$(PCOffFiltering).fadeIn(1);';
		count = count + 1;
	}
	if((request.body.RunDisplay == "RunDisplay") && (saveKwH > 0) && (request.body.Desktop == "Desktop"))
	{
		savings = savings + '$(estimate).append("<h5>' + count + '. Turn off the monitor and PC if you are not going to use the PC for 2 hours.</h5>");';
		savings = savings + '$(PCOffFiltering).fadeIn(1);$(MonitorFiltering).fadeIn(1);';
		count = count + 1;
	}
	
	var queryString = 'INSERT INTO Computer (UniqueCode,AgeComputer,DeviceType,Monitor,AgeMonitor,EnergyRated,UsageType,MonthlyUsage,DailyUsage,ScreenSaver,SetAfterWork,MultipleApps,RequireMultipleApps,SaveKwH,EstimatedKwH) VALUES("'+ UniqueCode + '", "' + AgeComputer + '", "' + DeviceType + '", "' + Monitor + '", "' + AgeMonitor + '", "' + EnergyRated + '", "' + UsageType + '", ' + MonthlyUsage + ', ' + DailyUsage + ', "' + ScreenSaver + '", "' + SetAfterWork + '", "' + MultipleApps + '", "' + RequireMultipleApps + '", ' + savePowerKwH + ', ' + estimatedPowerKwH + ');';
	
	var con = mysql.createConnection({
		  host: "localhost",
		  user: "mthirani",
		  password: "#Rpgsmn421#",
		  database: "GreenHomes"
		});
	con.connect(function(err) 
	{
	  if(err)
	  {
		log.error("Error while connecting to Db in function: computeComputerSavings for UniqueCode: " + UniqueCode);
		//throw err;
	  }
	});
	con.query(queryString, function(err, result) 
	{
	  if(err)
	  	log.error("Error in INSERT while storing Computer Profile informations in Db in function: computeComputerSavingsfor for UniqueCode: " + UniqueCode);
	  else
		log.trace("Computer Profile Information has been stored in Db for UniqueCode: " + UniqueCode);
	  con.end();
	});
	
	return savings;
}

function updateCompSettings(request)
{
	var UniqueCode = compPage.uniqueCode();
	var TurnOffPC = "";
	var TurnOffMonitor = "";
	var TurnOffScreenSaver = "";
	var UseEnergyRated = "";
	var TurnOffMultipleApps = "";
	
	if(request.body.TurnOffMonitorNo == "No")
		TurnOffMonitor = "No";
	if(request.body.TurnOffPCNo == "No")
		TurnOffPC = "No";
	if(request.body.TurnOffScreenSaverNo == "No")
		TurnOffScreenSaver = "No";
	if(request.body.EnergyRatedNo == "No")
		UseEnergyRated = "No";
	if(request.body.TurnOffMultipleAppsNo == "No")
		TurnOffMultipleApps = "No";
	if(request.body.TurnOffMonitorYes == "Yes")
		TurnOffMonitor = "Yes";
	if(request.body.TurnOffPCYes == "Yes")
		TurnOffPC = "Yes";
	if(request.body.TurnOffScreenSaverYes == "Yes")
		TurnOffScreenSaver = "Yes";
	if(request.body.EnergyRatedYes == "Yes")
		UseEnergyRated = "Yes";
	if(request.body.TurnOffMultipleAppsYes == "Yes")
		TurnOffMultipleApps = "Yes";
	
	var queryString1 = 'UPDATE Computer SET TurnOffPC="' + TurnOffPC + '" WHERE UniqueCode="' + UniqueCode + '";';
	var queryString2 = 'UPDATE Computer SET TurnOffMonitor="' + TurnOffMonitor + '" WHERE UniqueCode="' + UniqueCode + '";';
	var queryString3 = 'UPDATE Computer SET TurnOffScreenSaver="' + TurnOffScreenSaver + '" WHERE UniqueCode="' + UniqueCode + '";';
	var queryString4 = 'UPDATE Computer SET UseEnergyRated="' + UseEnergyRated + '" WHERE UniqueCode="' + UniqueCode + '";';
	var queryString5 = 'UPDATE Computer SET TurnOffMultipleApps="' + TurnOffMultipleApps + '" WHERE UniqueCode="' + UniqueCode + '";';
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
		log.error("Error while connecting to Db in function: updateCompSettings for UniqueCode: " + UniqueCode);
		//throw err;
	  }
	});
	con.query(queryString1, function(err, result) {});
	con.query(queryString2, function(err, result) {});
	con.query(queryString3, function(err, result) {});
	con.query(queryString4, function(err, result) {});
	con.query(queryString5, function(err, result) {});
	con.end();
	log.trace("Computer Additional Information has been stored in Db for UniqueCode: " + UniqueCode);
	
	return "OK";
}
exports.updateCompSettings = updateCompSettings;

function generateEndCompPage(request)
{
	var savings = computeComputerSavings(request);
	var page = "Error";
	if(!(savings == "Error"))
	{
		page = '<!DOCTYPE html><html lang="en"><head><title>Welcome To Green Homes !</title><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css"><script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script><script src="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>  <script>$(document).ready(function(){$(\'[data-toggle=\"tooltip\"]\').tooltip();});</script>  <script>$(document).ready(function(){' + savings + '$(EnergyRatedNo).click(function(){if($(EnergyRatedYes).is(":checked")){ $(EnergyRatedYes).attr("checked", false);}});$(EnergyRatedYes).click(function(){if($(EnergyRatedNo).is(":checked")){ $(EnergyRatedNo).attr("checked", false);}});$(TurnOffMultipleAppsNo).click(function(){if($(TurnOffMultipleAppsYes).is(":checked")){ $(TurnOffMultipleAppsYes).attr("checked", false);}});$(TurnOffMultipleAppsYes).click(function(){if($(TurnOffMultipleAppsNo).is(":checked")){ $(TurnOffMultipleAppsNo).attr("checked", false);}});$(TurnOffMonitorNo).click(function(){if($(TurnOffMonitorYes).is(":checked")){ $(TurnOffMonitorYes).attr("checked", false);}});$(TurnOffMonitorYes).click(function(){if($(TurnOffMonitorNo).is(":checked")){ $(TurnOffMonitorNo).attr("checked", false);}});$(TurnOffPCNo).click(function(){if($(TurnOffPCYes).is(":checked")){ $(TurnOffPCYes).attr("checked", false);}});$(TurnOffPCYes).click(function(){if($(TurnOffPCNo).is(":checked")){ $(TurnOffPCNo).attr("checked", false);}});$(TurnOffScreenSaverYes).click(function(){if($(TurnOffScreenSaverNo).is(":checked")){ $(TurnOffScreenSaverNo).attr("checked", false);}});$(TurnOffScreenSaverNo).click(function(){if($(TurnOffScreenSaverYes).is(":checked")){ $(TurnOffScreenSaverYes).attr("checked", false);}});});</script><style>.profile{color: DarkCyan;font-weight: bold;}</style></head><body><nav class="navbar navbar-default">  <div class="container">    <div class="navbar-header">      <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#myNavbar"><span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span></button><a class="navbar-brand" style="font-size: 25px;">Computer</a></div></div></nav><div class="well" style="background-color: rgb(250,254,254)"><div class="container"><div class="alert alert-info fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a><div id="estimate"></div></div></div><div class="container"><form class="form-horizontal" name="computer" id="computer" role="form" method="POST" action="/completeComputer"><div id="QuestionsFiltering"><table class="table table-striped"><tbody><tr><td style="color: darkslategrey"><div class="profile">The following questions ask you to tell us how likely you would be to change how you use your computer.</div><br/><div id="PCOffFiltering"><div class="form-group"><div class="col-xs-5"><label class="control-label" for="turnoffpc">Are you willing to turn off your computer after work? </label></div><input type="radio" style="vertical-align: middle; margin: 10px;" name="TurnOffPCYes" id="TurnOffPCYes" value="Yes" checked>Yes<input type="radio" style="vertical-align: middle; margin: 10px;" name="TurnOffPCNo" id="TurnOffPCNo" value="No">No</div></div><div id="MonitorFiltering"><div class="form-group"><div class="col-xs-5"><label class="control-label" for="turnoffmonitor">Are you willing to turn off your monitor after work? </label></div><input type="radio" style="vertical-align: middle; margin: 10px;" name="TurnOffMonitorYes" id="TurnOffMonitorYes" value="Yes" checked>Yes<input type="radio" style="vertical-align: middle; margin: 10px;" name="TurnOffMonitorNo" id="TurnOffMonitorNo" value="No">No</div></div><div id="ScreenSaverFiltering"><div class="form-group"><div class="col-xs-5"><label class="control-label" for="turnoffscreensaver">Are you willing to turn off your screensaver? </label></div><input type="radio" style="vertical-align: middle; margin: 10px;" name="TurnOffScreenSaverYes" id="TurnOffScreenSaverYes" value="Yes" checked>Yes<input type="radio" style="vertical-align: middle; margin: 10px;" name="TurnOffScreenSaverNo" id="TurnOffScreenSaverNo" value="No">No</div></div><div id="ApplicationsFiltering"><div class="form-group"><div class="col-xs-5"><label class="control-label" for="turnoffmultipleapps">Are you willing to close multiple applications while working? </label></div><input type="radio" style="vertical-align: middle; margin: 10px;" name="TurnOffMultipleAppsYes" id="TurnOffMultipleAppsYes" value="Yes" checked>Yes<input type="radio" style="vertical-align: middle; margin: 10px;" name="TurnOffMultipleAppsNo" id="TurnOffMultipleAppsNo" value="No">No</div></div><div id="EnergyRatedFiltering"><div class="form-group"><div class="col-xs-5"><label class="control-label" for="useenergyrated">Are you willing to use ENERGY RATED computer? </label></div><input type="radio" style="vertical-align: middle; margin: 10px;" name="EnergyRatedYes" id="EnergyRatedYes" value="Yes" checked>Yes<input type="radio" style="vertical-align: middle; margin: 10px;" name="EnergyRatedNo" id="EnergyRatedNo" value="No">No</div></div></td></tr></tbody></table></div><div class="container"><div class="form-group"><div class="row"><div class="col-sm-offset-5 col-sm-4"><button type="submit" class="btn btn-primary btn-md">Save & Next</button></div></div></div></div></form></div></div></body></html>';
	}
	return page;
}
exports.generateEndCompPage = generateEndCompPage;