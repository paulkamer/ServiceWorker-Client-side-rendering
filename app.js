var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cons = require('consolidate');

var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/static', express.static(path.join(__dirname, 'views')));

app.set('views', __dirname + '/views');
app.engine('html', cons.mustache);
app.engine('mst', cons.mustache);
app.engine('json', cons.mustache);
app.set('view engine', 'mustache');

app.get('/template.mst', function(req, res) {
  setTimeout(function() { res.render('template.mst') }, 1000); // simulate network & server-side delay
});

app.get('/data.json', function(req, res) {
  setTimeout(function() { res.render('data.json') }, 1000); // simulate network & server-side delay
});

// Route for a test page that uses a ServiceWorker
app.get('/index.html', function (req, res) {
  cons.mustache('views/partial.js.mst', {}, function(err, partial_html) {
    cons.mustache('views/layout_serviceworker.mst', { inline_javascript: partial_html }, function(err, html) {
      res.render('index.html', { layout: html });
    });
  })
});


module.exports = app;
