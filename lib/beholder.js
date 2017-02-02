const request = require('request');
const log = require('./log');
const parser = require('rss-parser');
const TimeQueue = require('timequeue');
const async = require('async');
const feeds = require('./models/feeds');

const throttle = process.env.THROTTLE || 20000;
const bigthrottle = process.env.FEED_LIST_THROTTLE || 60000;

function watch() {

  var queue = new TimeQueue(parser.parseURL, { concurrancy: 5, every: throttle });

  setInterval(() => {
    feeds.getFeedList((err, feeds) => {
      if (err) throw err;
      log.verbose('*** got new feed list ***');
      // log.verbose('***', feeds);

      feeds.forEach((feed) => {
        queue.push(feed.feedUrl, (err, result) => {
          if (err) throw err;
          log.info('*** FETCHED:', result.feed.title);

          feedProcessWaterfall(feed, result.feed, (err, res) => {
            if (err) log.error(err);
            log.info('*** waterfall complete');
          });
        });
      });
    });
  }, bigthrottle);
};

function feedProcessWaterfall(oldFeed, newFeed, cb) {

  async.waterfall([
    updateFeedMeta.bind(null, oldFeed, newFeed),
    feeds.getFeedEntries.bind(null, oldFeed._id),
    compareFeeds.bind(null, newFeed.entries),
    updateFeedContent.bind(null, oldFeed._id),
    emitNewArticles,
    ], (err, results) => {
    if (err) {
      return cb(err);
    }
    return cb(null, results);
  });
};

function updateFeedMeta(oldFeed, newFeed, cb) {
  var meta = {};
  var add = false;
  for (newKey in newFeed) {
    add = false;
    for (oldKey in oldFeed) {
      if (newKey === oldKey && newKey !== 'entries' && newKey !== 'feedUrl' &&
        (newFeed[newKey] !== oldFeed[oldKey])) {
        add = true;
      };
    };
    if (!(newKey in oldFeed) && newKey !== 'entries') add = true;
    if (add) {
      meta[newKey] = newFeed[newKey];
    };
  };
  if (meta !== {}) {
    feeds.updateFeedMeta(oldFeed._id, meta, (err) => {
      if (err) return cb(err);
      return cb(null);
    });
  } else {
    return cb(null);
  }
}

function compareFeeds(newFeed, oldFeed, cb) {
  log.verbose('*** Comparing Feeds ***');
  var finalFeed = [];
  var newArticles = [];
  var tmp = true;
  if (newFeed && oldFeed) {

    newFeed.forEach((newEntry) => {
      tmp = true;
      oldFeed.forEach((oldEntry) => {
        if ('guid' in newEntry && 'guid' in oldEntry) {
          if (newEntry.guid === oldEntry.guid) {
            finalFeed.push(newEntry);
            tmp = false;
          };
        } else if (newEntry.title === oldEntry.title) {
          finalFeed.push(newEntry);
          tmp = false;
        };
      });
      if (tmp) {
        newArticles.push(newEntry);
        finalFeed.push(newEntry);
        log.verbose('Found new article', newEntry.title);
      }
    });
  } else {
    newArticles = newFeed;
    finalFeed = newFeed;
  }

  log.verbose('######### feed compare results');
  if (oldFeed) log.verbose('oldFeed   length:', oldFeed.length);
  log.verbose('newFeed   length:', newFeed.length);
  log.verbose('finalFeed length:', finalFeed.length);
  log.verbose('new     articles:', newArticles.length);
  return cb(null, finalFeed, newArticles);
}

function updateFeedContent(feedId, feedForDB, articlesForEmit, cb) {
  log.verbose('*** Update Feed Content');
  feeds.updateFeedEntries(feedId, feedForDB, (err, result) => {
    if (err) return cb(err);
    log.verbose('Mongo update results', result.result);
    return cb(null, articlesForEmit);
  });
}

function emitNewArticles(articles) {
  articles.forEach((art) => {
    log.info('New Article', art.title);
  });
}

module.exports = {
  watch
};
