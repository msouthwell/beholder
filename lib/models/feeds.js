const DB = require('../../db');

var COLLECTION = 'feeds';

// get list of all feed ids and urls
function getFeedList(cb) {
  const db = DB.getDB();
  db.collection(COLLECTION).find({}, { _id: 1, feedUrl: 1 }).toArray(
    (err, docs) => {
      if (err) return cb(err);
      return cb(null, docs);
    });
};

function getFeedListWithMeta(cb) {
  const db = DB.getDB();
  db.collection(COLLECTION).find({}, { entries: 0 }).toArray(
    (err, docs) => {
      if (err) return cb(err);
      return cb(null, docs);
    });
};

function getFeed(feedId, cb) {
  db.collection(COLLECTION).find({ _id: feedId }).toArray((err, docs) => {
    if (err) return cb(err);
    return cb(null, docs[0]);
  });
};

function getFeedEntries(feedId, cb) {
  const db = DB.getDB();
  db.collection(COLLECTION).find({ _id: feedId }, { entries: 1 }).toArray((
    err, docs) => {
    if (err) return cb(err);
    return cb(null, docs[0].entries);
  });
};

function insertNewFeed(feed, cb) {
  const db = DB.getDB();
  db.collection(COLLECTION).insert(feed, { w: 1 }, (err, result) => {
    if (err) return cb(err);
    return cb(null, result);
  });
};

function updateFeedMeta(feedId, feedQueryUpdates, cb) {
  const db = DB.getDB();
  db.collection(COLLECTION).update({ _id: feedId }, { $set: feedQueryUpdates }, { upsert: true },
    (err, result) => {
      if (err) return cb(err);
      return cb(null, result);
    });
};

function updateFeedEntries(feedId, newEntries, cb) {
  const db = DB.getDB();
  db.collection(COLLECTION).update({ _id: feedId }, {
      $set: {
        dateLastUpdated: new Date(),
        'entries': newEntries
      }
    }, { upsert: true },
    (err, result) => {
      if (err) return cb(err);
      return cb(null, result);
    });
};

function storeNewArticle(article, cb) {
  const db = DB.getDB();
  db.collection('fresh').insert(article, (err, result) => {
    if (err) return cb(err);
    return cb(null, result);
  });
}

module.exports = {
  getFeedList,
  getFeed,
  getFeedEntries,
  insertNewFeed,
  updateFeedEntries,
  getFeedListWithMeta,
  updateFeedMeta,
  storeNewArticle
};
