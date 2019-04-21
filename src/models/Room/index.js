const mongoose = require('mongoose');

const RoomSchema = mongoose.Schema({
    chat: [{
        type: mongoose.Schema.Types.Mixed,
        _id: false,
    }],
    info: {
        word: { type: String },
        
    }
}, {
        versionKey: false,
    })

const model = mongoose.model('Room', RoomSchema, 'Rooms');

module.exports = model;