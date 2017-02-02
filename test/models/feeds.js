const assert = require('assert');
const DB = require('../../db');
const fixtures = require('../fixtures/model-feeds');
const singleFeed = require('../fixtures/model-feed');

var Feed = require('../../lib/models/feeds.js');

describe('Model Feed Tests', () => {

  before((done) => {
    DB.connect(DB.MODE_TEST, done);
  });

  beforeEach((done) => {
    DB.drop((err) => {
      if (err) return done(err);
      DB.fixtures(fixtures, done);
    });
  });

  it('getFeedList', (done) => {
    Feed.getFeedList((err, feeds) => {
      assert.equal(feeds.length, 3);
      assert('feedUrl' in feeds[0]);
      assert.equal(feeds[0].hasOwnProperty('_id'), true);
      assert.equal(feeds[0].hasOwnProperty('title'), false);
      done();
    });
  });

  it('getFeedListWithMeta', (done) => {
    assert(2 === 3);
    done();
  });

  it('getFeed', (done) => {
      Feed.getFeed('testId', (err, feed) => {
        assert.equal(feed.entries.length, 49);
        assert('title' in feed.entries[0]);
        assert('guid' in feed.entries[0]);
      });
      done();
  });

  it('getFeedEntries', (done) => {
    assert(2 === 3);
    done();
  });

  it('insertNewFeed', (done) => {
    Feed.insertNewFeed(singleFeed, (err, result) => {
      assert.equal(result.insertedCount, 1 );
    });
    done();
  });

  it('updateFeedMeta', (done) => {
    assert(2===3);
    done();
  });

  it('updateFeed', (done) => {
    assert(2===3);
    done();
  });

});
