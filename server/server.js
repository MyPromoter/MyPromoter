var express = require('express');
var app = express();
var routes = require('./routes/index.js');

// app.use('/', routes);
app.use(express.static(__dirname+'client'));
app.listen(8080);

console.log('*Server Initiated*');