var express = require('express');
var app = express();
var routes = require('./routes/index.js');

app.use('/', routes);

app.set('port', process.env.PORT || 1738);

var server = app.listen(app.get('port'), function() {
  console.log('*Server Initiated*');
});