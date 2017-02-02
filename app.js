const MongoClient = require('mongodb').MongoClient,
  conf = require('./config'),
  logger = require('morgan'),
  bodyParser = require('body-parser'),
  log = require('./lib/log'),
  routes = require('./lib/routes'),
  beholder = require('./lib/beholder'),
  // fixture = require('./test/fixtures/model-feeds.json'),
  db = require('./db'),
  express = require('express');

const app = express();

app.use(logger('dev'));


// initialize express
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers',
    'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', false);
  next();
});

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// some form of authentication middleware

app.use(routes);

// catch 404
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    log.error(err);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  log.error(err);
  res.json({
    message: err.message,
    error: {}
  });
});

db.connect('mode_production', () => {
  // db.drop();
  // db.fixtures(fixture, ()=> {
  //   ;
  // });
  app.listen(conf.get('port'), () => {
    log.info(
      `rss_watch is listening at ${conf.get('ip')}:${conf.get('port')}`
    );
    beholder.watch(db);
  });
});

// MongoClient.connect(`${conf.get('db.uri')}:${conf.get('db.port')}/${conf.get('db.name')}`, (err, db) => {

//   if (err) log.error(`Failed to connect to the databse. ${err.stack}`);
//   app.locals.db = db;
//   app.listen(conf.get('port'), () => {
//     log.info(`rss_watch is listening at ${conf.get('ip')}:${conf.get('port')}`);
//     beholder.watch(db);
//   });
// });
