const path = require('path');

/* istanbul ignore next */
const requireProcessEnv = (name) => {
    if (!process.env[name]) {
        throw new Error('You must set the ' + name + ' environment variable');
    }
    return process.env[name];
}

const config = {
    all: {
        env: process.env.NODE_ENV || 'development',
        root: path.join(__dirname, '..'),
        port: process.env.PORT || 6300,
        ip: process.env.IP || '0.0.0.0',
        dbConfig: {
            uri: 'mongodb://localhost/kroko'
        },
        baseURL: 'http://localhost:3000',

    },

    production: {
        ip: process.env.IP || '0.0.0.0',
        port: process.env.PORT || 6300
    },

    test: {
        dbConfigTest: {
            uri: 'mongodb://localhost/krokoTest'
        },
    }
}

console.log('ENV:', config.all.env);

module.exports = Object.assign(config.all, config[config.all.env] || {});