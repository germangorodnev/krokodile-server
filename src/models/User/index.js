const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    info: {
        email: { type: String },
        username: { type: String },

        firstName: { type: String, },
        lastName: { type: String },
        age: { type: Number },
        about: { type: String },
        registrationDate: { type: Date },
        avatar: { type: String, default: undefined },
    },
    progress: {
        type: [{
            courseIndex: { type: Number },
            lessonsDone: { type: Number },
            _id: false,
        }],
        _id: false
    },

    lessonProgress: {
        type: mongoose.Schema.Types.Mixed,
    },

    badges: {
        type: [{
            bid: { type: mongoose.Schema.Types.ObjectId },
            at: { type: Date },
            _id: false,
        }],
        _id: false,
    },

    auth: {
        emailConfirmed: { type: Boolean, default: false },
        emailCid: { type: String, default: undefined },
        password: { type: String },
        oauth: {
            google: { type: String },
            facebook: { type: String },
            vk: { type: String },
        },
        push: {
            chrome: { type: String },
            firefox: { type: String },
        },
    },

}, {
        versionKey: false,
    })

const model = mongoose.model('User', userSchema, 'users');

module.exports = model;