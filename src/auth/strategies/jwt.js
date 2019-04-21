const passportJwt = require('passport-jwt');
const { Strategy } = passportJwt;
const User = require('~/models/User');
const config = require('../config')
const jwt = require('jsonwebtoken');

const opts = {
    jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.auth.secret,
};

module.exports = new Strategy(opts, async (jwtPayload, done) => {
    // if ((jwtPayload.exp - Date.now()) < 0) {
    //     return done({ error: 'expired' }, false);
    // }
    const user = await User.findById(jwtPayload.id).lean().exec();
    if (user) {
        done(null, user);
    } else {
        done(null, false);
    }
});
