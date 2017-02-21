const amqp = require('../../amqp.js');
const conf = require('../../config');

function sendArticleId(id, cb) {
  const conn = amqp.getConnection();

  conn.createChannel((err, ch) => {
    if (err) console.log(err);
    console.log('sending message', id);
    const q = conf.get('new_article_queue');
    console.log(typeof id);
    try {
      ch.assertQueue(q, {durable: true});
      ch.sendToQueue(q, new Buffer(id.toString()), {persistent: true});
      return cb(null);
    } catch (e) {
      return cb(e);
    }
  });
};

module.exports = {
  sendArticleId
};
