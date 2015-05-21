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

// Preload some data
var COUNTRIES = JSON.parse(fs.readFileSync("data/countries.json"));
var ORDER = JSON.parse(fs.readFileSync("../src/order.json"));

var DATA = [
  { name: "Black Shoes",       date: "2010-11-12", cost: 1199.00,        color: ["#000"], country: null, city: null, isEpic: true },
  { name: "Red Socks",         date: "2003-01-03", cost: 59.99,          color: ["#f00"], country: null, city: null, isEpic: true },
  { name: "Blue Sweater",      date: "2015-01-14", cost: 499.00,         color: ["#00f"], country: null, city: null, isEpic: true },
  { name: "Yellow Pants",      date: "2013-11-14", cost: 749.95,         color: ["#ff0"], country: null, city: null, isEpic: true },
  { name: "Green Shorts",      date: "2012-11-15", cost: 1000.00,        color: ["#0f0"], country: null, city: null, isEpic: true },
  { name: "Pink Meat",         date: "2013-06-05", cost: 449.99,         color: ["#ff9"], country: null, city: null, isEpic: true },
  { name: "Orange Banana",     date: "2013-08-20", cost: 4.13,           color: ["#fc3"], country: null, city: null, isEpic: true },
  { name: "Peach Apple",       date: "2011-05-23", cost: 5.48,           color: ["#f49"], country: null, city: null, isEpic: true },
  { name: "Purple Ions",       date: "2003-10-36", cost: 44221012095.95, color: ["#f0f"], country: null, city: null, isEpic: true },
  { name: "Brown Sugar",       date: "2009-06-30", cost: 0.75,           color: ["#651"], country: null, city: null, isEpic: true },
  { name: "Red Herring",       date: "2004-11-12", cost: 1199.00,        color: ["#000"], country: null, city: null, isEpic: true },
  { name: "Blue Monday",       date: "2000-01-03", cost: 59.99,          color: ["#f00"], country: null, city: null, isEpic: true },
  { name: "Black Death",       date: "2001-01-14", cost: 499.00,         color: ["#00f"], country: null, city: null, isEpic: true },
  { name: "Yellow Underpants", date: "2003-11-14", cost: 749.95,         color: ["#ff0"], country: null, city: null, isEpic: true },
  { name: "Cardinal Red",      date: "2004-11-15", cost: 1000.00,        color: ["#0f0"], country: null, city: null, isEpic: true },
  { name: "Monsanto Grey",     date: "2013-06-05", cost: 449.99,         color: ["#ff9"], country: null, city: null, isEpic: true },
  { name: "Golden Johnson",    date: "2013-08-20", cost: 4.13,           color: ["#fc3"], country: null, city: null, isEpic: true },
  { name: "Brown Nose",        date: "2012-05-23", cost: 5.48,           color: ["#f49"], country: null, city: null, isEpic: true },
  { name: "White Chocolate",   date: "2009-10-36", cost: 44221012095.95, color: ["#f0f"], country: null, city: null, isEpic: true },
  { name: "Pink Panther",      date: "2004-06-30", cost: 0.75,           color: ["#651"], country: null, city: null, isEpic: true },
  { name: "Green Weed",        date: "2011-11-12", cost: 1199.00,        color: ["#000"], country: null, city: null, isEpic: true },
  { name: "Orange Box",        date: "2012-01-03", cost: 59.99,          color: ["#f00"], country: null, city: null, isEpic: true },
  { name: "Yellow Banana",     date: "2006-01-14", cost: 499.00,         color: ["#00f"], country: null, city: null, isEpic: true },
  { name: "Aquamarine Marine", date: "2008-11-14", cost: 749.95,         color: ["#ff0"], country: null, city: null, isEpic: true },
  { name: "Rezeda Cupboard",   date: "2013-11-15", cost: 1000.00,        color: ["#0f0"], country: null, city: null, isEpic: true },
  { name: "Apricot Jam",       date: "2013-06-05", cost: 449.99,         color: ["#ff9"], country: null, city: null, isEpic: true },
  { name: "Green Fig",         date: "2013-08-20", cost: 4.13,           color: ["#fc3"], country: null, city: null, isEpic: true },
  { name: "Orange Leaf",       date: "2012-05-23", cost: 5.48,           color: ["#f49"], country: null, city: null, isEpic: true },
  { name: "Bloody Red",        date: "2009-10-36", cost: 44221012095.95, color: ["#f0f"], country: null, city: null, isEpic: true },
  { name: "Black Ninja",       date: "2000-06-30", cost: 0.75,           color: ["#651"], country: null, city: null, isEpic: true },
  { name: "Gandalf the Grey",  date: "2011-11-12", cost: 1199.00,        color: ["#000"], country: null, city: null, isEpic: true },
  { name: "Gandalf the White", date: "2012-01-03", cost: 59.99,          color: ["#f00"], country: null, city: null, isEpic: true },
  { name: "Blue Mangroup",     date: "2013-01-14", cost: 499.00,         color: ["#00f"], country: null, city: null, isEpic: true },
  { name: "Teal Protoss",      date: "2013-11-14", cost: 749.95,         color: ["#ff0"], country: null, city: null, isEpic: true },
  { name: "Purple Rain",       date: "2013-11-15", cost: 1000.00,        color: ["#0f0"], country: null, city: null, isEpic: true },
  { name: "Dark Matter",       date: "2013-06-05", cost: 449.99,         color: ["#ff9"], country: null, city: null, isEpic: true },
  { name: "Silver Surfer",     date: "2013-08-20", cost: 4.13,           color: ["#fc3"], country: null, city: null, isEpic: true },
  { name: "Bronze Monument",   date: "2012-05-23", cost: 5.48,           color: ["#f49"], country: null, city: null, isEpic: true },
  { name: "Ruby Gem",          date: "2001-10-36", cost: 44221012095.95, color: ["#f0f"], country: null, city: null, isEpic: true },
  { name: "Sapphire Radeon",   date: "2000-06-30", cost: 0.75,           color: ["#651"], country: null, city: null, isEpic: true },
  { name: "Orange Reef",       date: "2011-11-12", cost: 1199.00,        color: ["#000"], country: null, city: null, isEpic: true },
  { name: "White Boat",        date: "2012-01-03", cost: 59.99,          color: ["#f00"], country: null, city: null, isEpic: true },
  { name: "Transparent Glass", date: "2013-01-14", cost: 499.00,         color: ["#00f"], country: null, city: null, isEpic: true },
  { name: "Blue Deep Sea",     date: "2013-11-14", cost: 749.95,         color: ["#ff0"], country: null, city: null, isEpic: true },
  { name: "Black Widow",       date: "2013-11-15", cost: 1000.00,        color: ["#0f0"], country: null, city: null, isEpic: true },
  { name: "White Light",       date: "2013-06-05", cost: 449.99,         color: ["#ff9"], country: null, city: null, isEpic: true },
  { name: "Brown Monkeys",     date: "2013-08-20", cost: 4.13,           color: ["#fc3"], country: null, city: null, isEpic: true },
  { name: "Metallic Wrench",   date: "2012-05-23", cost: 5.48,           color: ["#f49"], country: null, city: null, isEpic: true },
  { name: "Mahagony Fox",      date: "2009-10-36", cost: 44221012095.95, color: ["#f0f"], country: null, city: null, isEpic: true },
  { name: "Cherry Pie",        date: "2000-06-30", cost: 0.75,           color: ["#651"], country: null, city: null, isEpic: true },
  { name: "Tan Tent",          date: "2011-11-12", cost: 1199.00,        color: ["#000"], country: null, city: null, isEpic: true },
  { name: "Blue Suede",        date: "2012-01-03", cost: 59.99,          color: ["#f00"], country: null, city: null, isEpic: true },
  { name: "Yellow Linens",     date: "2013-01-14", cost: 499.00,         color: ["#00f"], country: null, city: null, isEpic: true },
  { name: "Dark Iron",         date: "2013-11-14", cost: 749.95,         color: ["#ff0"], country: null, city: null, isEpic: true },
];

var COLORS = [
  { label: "Bright colors" },
	{ label: "Red",            value: "#f00" },
	{ label: "Cyan",           value: "#0ff" },
	{ label: "Magenta",        value: "#f0f" },
	{ label: "Yellow",         value: "#ff0" },
  { label: "Pink",           value: "#ff9" },
  { label: "Orange",         value: "#fc3" },
  { label: "Peach",          value: "#f94" },
  { label: "Dark Colors" },
	{ label: "Green",          value: "#0f0" },
	{ label: "Blue",           value: "#00f" },
	{ label: "Black",          value: "#000" },
  { label: "Brown",          value: "#651" },
  { label: "Purple",         value: "#606" },
  { label: "Other" },
  { label: "Red and Yellow", value: "MK" },
];

var CITIES = [
  { label: "WildcardBurg", value: "*",           group: "Any" },
  { label: "Netherlands" },
	{ label: "Amsterdam",    value: "amsterdam",   group: "NL" },
	{ label: "Utrecht",      value: "utrecht",     group: "NL" },
	{ label: "Maastricht",   value: "maastricht",  group: "NL" },
  { label: "Belium" },
	{ label: "Bruxelles",    value: "bruxelles",   group: "BE" },
	{ label: "Bruges",       value: "bruges",      group: "BE" },
	{ label: "Antwerpen",    value: "antwerpen",   group: "BE" },
  { label: "France" },
	{ label: "Paris",        value: "paris",       group: "FR" },
  { label: "Lyon",         value: "lyon",        group: "FR" },
  { label: "Strasbourg",   value: "strasbourg",  group: "FR" },
  { label: "Nice",         value: "nice",        group: "FR" },
  { label: "Cannes",       value: "cannes",      group: "FR" },
  { label: "Marseilles",   value: "marseilles",  group: "FR" },
  { label: "Germany" },
  { label: "Aachen",       value: "aachen",      group: "DE" },
	{ label: "Frankfurt",    value: "frankfurt",   group: "DE" },
	{ label: "Berlin",       value: "berlin",      group: "DE" },
	{ label: "Munchen",      value: "munchen",     group: "DE" },
	{ label: "Mainz",        value: "mainz",       group: "DE" },
	{ label: "Köln",         value: "köln",        group: "DE" },
	{ label: "Düsseldorf",   value: "düsseldorf",  group: "DE" },
  { label: "United Kingdom" },
	{ label: "London",       value: "london",      group: "UK" },
  { label: "Manchester",   value: "manchester",  group: "UK" },
  { label: "Brighton",     value: "brighton",    group: "UK" },
  { label: "Birmingham",   value: "birmingham",  group: "UK" },
  { label: "Australia" },
  { label: "Pert",         value: "pert",        group: "AU" },
  { label: "Sydney",       value: "sydney",      group: "AU" },
  { label: "Canberra",     value: "canberra",    group: "AU" },
  { label: "Japan" },
	{ label: "Kyoto",        value: "kyoto",       group: "JP" },
	{ label: "Osaka",        value: "osaka",       group: "JP" },
	{ label: "Tokyo",        value: "tokyo",       group: "JP" },
	{ label: "Sapporo",      value: "sapporo",     group: "JP" },
	{ label: "Satsuma",      value: "satsuma",     group: "JP" },
  { label: "Russia" },
	{ label: "Москва",       value: "moscow",      group: "RU" },
	{ label: "Владивосток",  value: "vladivostok", group: "RU" },
  { label: "Одеса",        value: "odessa",      group: "RU" },
  { label: "Сочи",         value: "sochi",       group: "RU" },
  { label: "Волгоград",    value: "volgograd",   group: "RU" },
  { label: "Macedonia" },
  { label: "Скопје",       value: "skopje",      group: "MK" },
  { label: "Битола",       value: "bitola",      group: "MK" },
  { label: "Тетово",       value: "tetovo",      group: "MK" }
]

server.use('/data/countries-filter', function(req, res, next){
  var text = req.query.data.text.toLowerCase();
  setTimeout(function(){
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(COUNTRIES.filter(function(country){
      return country.label.toLowerCase().indexOf(text) > -1;
    })));
  }, 500);
});

server.use('/data/countries', function(req, res, next){
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(fs.readFileSync("data/countries.json"));
});

server.use('/data/cities', function(req, res, next){
  res.writeHead(200);
  res.end(JSON.stringify(CITIES));  
});

server.use('/data/colors', function(req, res, next){
  res.writeHead(200);
  res.end(JSON.stringify(COLORS));  
});

/**
 * Query arguments:
    c - sort column
    d - sort direction
    p - page number
    s - page size
    f_* - filter column
**/
server.use('/data/grid', function(req, res, next){
  var query = req.query, page = query.p || 1, size = query.s || DATA.length - 1;
  var filters = {}, dataset;
  
  for(var i in query) {
    if(i.indexOf('f_') === 0) {
      filters[ i.substr(2) ] = query[i];
    }
  }

  dataset = DATA.slice();
  dataset = dataset.filter(function(item){
    for(var name in filters) {
      if(name in item) {
        return ("" + item[name]).toLowerCase().indexOf(filters[name].toLowerCase()) > -1;
      }
    }
    return true;
  });
  
  if(query.c && query.d) {
    dataset.sort(function(a, b){
      return (query.d === 'asc' ? 1 : -1) * (a[query.c] > b[query.c] ? 1 : a[query.c] < b[query.c] ? -1 : 0);
    });
  }

  res.writeHead(200, { 'X-Item-Count': dataset.length });
  res.end(JSON.stringify( dataset.slice((page - 1) * size, page * size)));
});

server.use('/test', function(req, res, next){
  res.writeHead(200, {'Content-Type': 'text/html'});
  fs.createReadStream("test.html").pipe(res);
});


server.use("/", function(req, res, next){
  var data = fs.readFileSync("index.html", 'UTF-8');
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(data.replace("<!-- scripts -->", ORDER.js.map(function(file){
    return '<script src="/static/js/' + file + '"></script>';
  }).join("")));
});

http.createServer(server).listen(3001);
console.log("Development server running at 127.0.0.1:3001. Powered by Node.js " + process.versions.node + ".");
