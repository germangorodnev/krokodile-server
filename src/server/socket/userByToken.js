const jwt = require('jsonwebtoken');
const { secret } = require('./config');
const User = require('~/models/User');

module.exports = async (token) => {
    const payload = jwt.verify(token, secret, {});
    const user = await User.findById(payload.id).exec();
    if (user !== null) {
        return user;
    } else {
        throw new Error('Invalid token');
    }
}