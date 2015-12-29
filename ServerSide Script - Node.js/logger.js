var log4js = require('log4js');
log4js.clearAppenders()
log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('test.log'), 'test');
var logger = log4js.getLogger('test');
logger.setLevel('ERROR');
logger.setLevel('TRACE');

var getLogger = function() {
   return logger;
};

exports.logger = getLogger();