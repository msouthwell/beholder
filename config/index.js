/*jshint esversion: 6 */

const convict = require('convict');
const validator = require('validator');

convict.addFormat({
  name: 'mongo-uri',
  validate: (val) => {
    if (!validator.isURL(val, { protocols: ['mongodb'] })) {
      throw new Error('must be a MongoDB URI');
    }
  }
});

var conf = convict({
  env: {
    doc: 'The rss_watch environment',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  ip: {
    doc: 'The IP address to bind.',
    format: 'ipaddress',
    default: '127.0.0.1',
    env: 'IP_ADDRESS',
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 3001,
    env: 'PORT'
  },
  emit: {
    doc: 'The url to post articles to',
    format: 'url',
    default: 'http://localhost:3002/article',
    env: 'EMIT_URL'
  },
  db_prod: {
    uri: {
      doc: 'Mongo URI',
      format: 'mongo-uri',
      default: 'mongodb://localhost:27017/beholder_prod',
      env: 'DB_PROD_URI'
    },
    name: {
      doc: 'database name',
      format: (val) => typeof val === 'string',
      default: 'temporal',
      env: 'DB_NAME'
    }
  },
  db_test: {
    uri: {
      doc: 'Mongo URI',
      format: 'mongo-uri',
      default: 'mongodb://localhost:27017/beholder_test',
      env: 'DB_TEST_URI'
    },
  }
});

const env = conf.get('env');

conf.validate({ strict: true });

module.exports = conf;
