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

exports.ab2str = (array) => {
    let out, i, len, c;
    let char2, char3;
    out = "";
    len = array.length;
    i = 0;
    while (i < len) {
        c = array[i++];
        switch (c >> 4) {
            case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
                // 0xxxxxxx
                out += String.fromCharCode(c);
                break;
            case 12: case 13:
                // 110x xxxx   10xx xxxx
                char2 = array[i++];
                out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                break;
            case 14:
                // 1110 xxxx  10xx xxxx  10xx xxxx
                char2 = array[i++];
                char3 = array[i++];
                out += String.fromCharCode(((c & 0x0F) << 12) |
                    ((char2 & 0x3F) << 6) |
                    ((char3 & 0x3F) << 0));
                break;
        }
    }
    return out;
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