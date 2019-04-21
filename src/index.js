require('module-alias/register');
process.env.NTBA_FIX_319 = 1;
exports = module.exports = require('./app');
