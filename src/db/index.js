const mongoose = require('mongoose');

module.exports = (config) => new Promise((resolve, reject) => {
    mongoose.set('useFindAndModify', false);
    mongoose.connection
        .on('error', error => reject(error))
        .on('close', () => console.log('Database connection closed.'))
        .once('open', () => resolve(mongoose.connections[0]));

    mongoose.connect(config.uri, {
        useNewUrlParser: true,
    });
});