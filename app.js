
/**
 * Module dependencies.
 */

var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , path = require('path')
  , fs = require('fs')
  ;

/*****************
 * Server
*****************/

app.configure(function () {
  app.set('port', process.env.PORT || 3000);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('less-middleware')({
    src:  __dirname + '/less'
  , dest: __dirname + '/public/css'
  , prefix: '/css'
  }));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function () {
  app.use(express.errorHandler());
});

server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});

/*****************
 * Sockets
*****************/

var testFile = __dirname + '/test.md';

io.sockets.on('connection', function (socket) {
  fs.watchFile(testFile, function (curr, prev) {
    fs.readFile(testFile, 'utf8', function (err, data) {
      if (!err && data) {
        socket.emit('update', data);
      }
    });
  });
});
