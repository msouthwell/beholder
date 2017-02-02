const debug = require('debug');

const log = {
    info: debug('beholder:info'),
    error: debug('beholder:error'),
    verbose: debug('beholder:verbose'),
};

log.info.log = console.log.bind(console);

module.exports = log;
