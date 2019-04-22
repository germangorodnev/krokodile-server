// const jwt = require('jsonwebtoken');
// const { secret } = require('./config');
// const User = require('~/models/User');

// module.exports = async (token) => {
//     const payload = jwt.verify(token, secret, {});
//     const user = await User.findById(payload.id).exec();
//     if (user !== null) {
//         return user;
//     } else {
//         throw new Error('Invalid token');
//     }
// }

exports.stringToArray = (s) => {
    const utf8 = unescape(encodeURIComponent(s));
    const arr = [];
    for (let i = 0; i < utf8.length; ++i) 
        arr.push(utf8.charCodeAt(i));
    return arr;
}

exports.createEvent = (type, data) => {
    if (typeof data === 'undefined') {
        data = [];
    } else if (!(data instanceof Uint8Array)) {
        data = exports.stringToArray(JSON.stringify(data));
    }
    
    const res = new Uint8Array(data.length + 1);
    res[0] = type;
    if (data.length > 0)
        res.set(data, 1);

    const b = res.buffer.slice(res.byteOffset, res.byteOffset + res.byteLength);
    return b;
}