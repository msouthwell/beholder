const DB = require('../../db');

var COLLECTION = 'feeds';

// get list of all feed ids and urls
getFeedList = (cb) => {
  const db = DB.getDB();
  db.collection(COLLECTION).find({}, { _id: 1, feedUrl: 1 }).toArray(
    (err, docs) => {
    if (err) return cb(err);
    return cb(null, docs);
  });
};

getFeedListWithMeta = (cb) => {
  const db = DB.getDB();
  db.collection(COLLECTION).find({}, {entries: 0}).toArray(
    (err, docs) => {
      if (err) return cb(err);
      return cb(null, docs);
    });
};

getFeed = (feedId, cb) => {
  const db = DB.getDB();
  db.collection(COLLECTION).find({ _id: feedId }).toArray((err, docs) => {
    if (err) return cb(err);
    return cb(null, docs[0]);
  });
};

getFeedEntries = (feedId, cb) => {
  const db = DB.getDB();
  db.collection(COLLECTION).find({ _id: feedId }, { entries: 1 }).toArray((
    err, docs) => {
    if (err) return cb(err);
    return cb(null, docs[0].entries);
  });
};

insertNewFeed = (feed, cb) => {
  const db = DB.getDB();
  db.collection(COLLECTION).insert(feed, { w: 1 }, (err, result) => {
    if (err) return cb(err);
    return cb(null, result);
  });
};
updateFeedMeta =  (feedId, feedQueryUpdates, cb) => {
  const db = DB.getDB();
  db.collection(COLLECTION).update({_id: feedId}, {$set: feedQueryUpdates }, {upsert: true},
    (err, result) => {
      if (err) return cb(err);
      return cb(null, result);
    });
};
updateFeedEntries = (feedId, newEntries, cb) => {
  const db = DB.getDB();
  db.collection(COLLECTION).update({ _id: feedId }, { $set: {dateLastUpdated: new Date() ,
      'entries': newEntries }}, { upsert: true },
    (err, result) => {
      if (err) return cb(err);
      return cb(null, result);
    });
};
module.exports = {
  getFeedList,
  getFeed,
  getFeedEntries,
  insertNewFeed,
  updateFeedEntries,
  getFeedListWithMeta,
  updateFeedMeta
};
