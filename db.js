const MongoClient = require('mongodb').MongoClient;
const async = require('async');
const conf = require('./config');

var state = {
  db: null,
  mode: null,
};

exports.MODE_TEST = 'mode_test';
exports.MODE_PRODUCTION = 'mode_production';

// connects to either production or test database
exports.connect = (mode, done) => {
  if (state.db) return done();

  const uri = mode === exports.MODE_TEST ? conf.get('db_test.uri') : conf.get(
    'db_prod.uri');

  MongoClient.connect(uri, (err, db) => {
    if (err) return done(err);
    state.db = db;
    state.mode = mode;
    console.log('MongoClient connected at', uri);
    done();
  });
};

// get active database connection
exports.getDB = () => {
  return state.db;
};

// clear all connections in the database
exports.drop = (done) => {
  if (!state.db) return done();
  state.db.collections((err, collections) => {
    async.each(collections, (collection, cb) => {
      if (collection.collectionName.indexOf('system') === 0) {
        return cb();
      }
      collection.remove(cb);
    }, done);
  });
};

// load data from a JSON structure into the database
exports.fixtures = (data, done) => {
  const db = state.db;
  if (!db) return done(new Error('Missing database connection.'));

  const names = Object.keys(data.collections);
  async.each(names, (name, cb) => {
    db.createCollection(name, (err, collection) => {
      if (err) return cb(err);
      collection.insert(data.collections[name], cb);
    });
  }, done);
};
