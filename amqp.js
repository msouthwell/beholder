const amqp = require('amqplib/callback_api');

var connection;

function connect(done) {
  amqp.connect('amqp://localhost', (err, conn) => {
    if (err) bail(err);
    connection = conn;
    console.log('amqp connected');
    done();
  });
};

function bail(err) {
  if (connection) connection.close();
  console.error(err);
  process.exit(1);
};

function getConnection() {
  return connection;
};

module.exports = {
  connect,
  bail,
  getConnection
};
