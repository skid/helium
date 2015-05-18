// Concatenates and minifies the scripts and places them in the build folder.
var uglifyjs = require('uglify-js')
var uglifycss = require('uglifycss');
var fs = require('fs');
var path = require('path');

// Order of concatenation
var order   = JSON.parse(fs.readFileSync(path.join(__dirname, 'src', 'order.json')));
var pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')));
var root = path.join(__dirname, 'build')

if(!fs.existsSync(root)){
  fs.mkdirSync(root);
}
if(!fs.existsSync(path.join(root, 'js'))){
  fs.mkdirSync(path.join(root, 'js'));
}
if(!fs.existsSync(path.join(root, 'css'))){
  fs.mkdirSync(path.join(root, 'css'));
}

console.log("Building js...");
var files = order.js.map(function(file){ 
  return path.join(__dirname, 'src', 'js', file); 
});
try {
  var jsmin = uglifyjs.minify(files, {});
} catch (e){
  console.log(e);
  process.exit(1);
}
fs.writeFileSync(path.join(root, 'js', 'helium-' + pkg.version + '.min.js'), jsmin.code, { flag: 'w' });

console.log("Building css...");
var files = order.css.map(function(file){ 
  return path.join(__dirname, 'src', 'css', file); 
});
var cssmin = uglifycss.processFiles(files);
fs.writeFileSync(path.join(root, 'css', 'helium-' + pkg.version + '.min.css'), cssmin, { flag: 'w' });

console.log("Done...");