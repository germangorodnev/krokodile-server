const compose = require('koa-compose');
const cors = require('@koa/cors');
const bodyParser = require('koa-bodyparser');

// our own middlewares
const logger = require('./logger');
const errors = require('./errors');

module.exports = function middleware() {
    const mws = [];
    if (process.env.NODE_ENV !== 'test') {
        mws.push(logger);
    } 
    mws.push(errors, cors(), bodyParser());
    return compose(mws);
}
