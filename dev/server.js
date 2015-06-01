/**
 * This is a node.js development server for Amp.
 * It requires Node.js Connect https://github.com/senchalabs/connect
 * 
 * If you want to develop or demo Amp, instead of 
 * opening the index.html file run "node server.js" in your 
 * shell and visit http://localhost:3000.
 * 
 * If you don't/can't have node then just open the index.html file 
 * and remove all "/static" prefixes on included .js and .css files.
**/
var fs          = require('fs');
var qs          = require('qs');
var url         = require('url');
var path        = require('path');
var connect     = require('connect');
var serveStatic = require('serve-static');
var http        = require('http');
var server      = connect();

// Serve 3rd party libraries
server.use('/static/lib', serveStatic(path.normalize(__dirname + '/lib')));
// Serve data
server.use('/static/data', serveStatic(path.normalize(__dirname + '/sample-data')));
// Serve development scripts
server.use('/static/dev/', serveStatic(__dirname));
// Serve static files
server.use('/static', serveStatic(path.normalize(__dirname + '/../src')));
// Return a 404 on static misses
server.use('/static', function(req, res, next){
  res.writeHead(404, "Not Found");
  return res.end("Page Not Found");
});
// Parse querystrings
server.use(function(req, res, next){
  req.query = qs.parse(url.parse(req.url).query);
  next();
});

var ORDER = JSON.parse(fs.readFileSync("../src/order.json"));

server.use("/", function(req, res, next){
  var data = fs.readFileSync("index.html", 'UTF-8');
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(data.replace("<!-- scripts -->", ORDER.js.map(function(file){
    return '<script src="/static/js/' + file + '"></script>';
  }).join("")));
});

http.createServer(server).listen(3001);
console.log("Development server running at 127.0.0.1:3001. Powered by Node.js " + process.versions.node + ".");
