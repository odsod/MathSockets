/**
 * Module dependencies.
 */
var express = require('express')
  , app     = express()
  , server  = require('http').createServer(app)
  , io      = require('socket.io').listen(server)
  , path    = require('path')
  , fs      = require('fs')
  , argv    = require('optimist').argv
  ;

console.log(argv._[0]);

/**
 * The Markdown file to watch and render in the browser
 */
var file = path.join(process.cwd(), argv._[0]);

/**
 * Only run script if valid file to watch is supplied on command line
 */
if (typeof argv._[0] !== 'string' || !path.existsSync(file)) {
  console.log('You must supply a markdown file as argument!');
  process.exit(1);
}

/**
 * Watch the file and push updates to sockets
 */
function pushFile() {
  fs.readFile(file, 'utf8', function (err, data) {
    if (!err && data) {
      io.sockets.emit('update', data);
    }
  });
}

fs.watchFile(file, function (curr, prev) {
  pushFile();
});

io.sockets.on('connection', function (socket) {
  pushFile();
});

/**
 * HTML to serve
 */
var cssFile = argv.css && 'file://' + path.join(process.cwd(), argv.css);

/**
 * Server
 */
app.configure(function () {
  app.set('port', argv.port || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'hjs');
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'resources')));
});

app.get('/', function (req, res) {
  res.render('app', {
    title: argv._[0].split('.')[0]
  , stylesheet: {
      path: cssFile
    }
  });
});

server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
