const bcrypt = require('bcrypt');

module.exports.hash = async(password) => {
    const salt = await bcrypt.genSalt(10);
    // apply
    const hash = await bcrypt.hash(password, salt);
    return hash;
}

module.exports.match = async(password, hash) => {
    return await bcrypt.compare(password, hash);
}