var express = require('express');
var app = express();
var routes = require('./routes/index.js');

app.use('/', routes);

app.set('port', process.env.PORT || 1738);

// view engine setup
app.set('views', __dirname + '../client/views');
app.set('view engine', 'jsx');
app.engine('jsx', require('express-react-views').createEngine());

var server = app.listen(app.get('port'), function() {
  console.log('*Server Initiated*');
});