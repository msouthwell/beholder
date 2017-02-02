const express = require('express');
const router = new express.Router();
const log = require('../log');
const feeds = require('../models/feeds');
const parser = require('rss-parser');

// get all rss feed info except entries
router.get('/feed', (req, res) => {
  feeds.getFeedListWithMeta((err, result) => {
    if (err) next(err);
    res.json(result);
  });
});

// add a new feed to the database
router.post('/feed', (req, res, next) => {
  const body = req.body;
  if (!body.feedUrl) next(new Error('Must provide a feedUrl'));

  parser.parseURL(body.feedUrl, (err, result) => {
    if (err) {
      next(new Error('URL failed to parse'));
    } else {
      log.info('*** FETCHED New Feed:', result.feed.title);
      console.log(result.feed);
      body.dateAdded = new Date();
      feeds.insertNewFeed(body, (err, result) => {
        if (err) {
          if (err.name === 'MongoError' && err.code === 11000) {
            return res.status(500).send({ success: false, message: 'Feed already exists!' });
          }
          return res.status(500).send(err);
        }
        log.verbose('new feed id', result.result);
        res.json(result);
      });
    }
  });
});

module.exports = router;
