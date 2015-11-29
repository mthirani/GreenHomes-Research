var url = require("url");

function getPath(request) {  
  var path = url.parse(request.url).pathname;
  return path;
}
exports.getPath = getPath;