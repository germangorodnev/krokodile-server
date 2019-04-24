exports.GAME_STATES = {
    CREATED: 0,
    SELECTING_WORD: 1,
    PLAYING: 2,
    FINISHED: 3,
};

exports.ROLES = {
    DRAWER: 0,
    GUESSER: 1
};

exports.GAME_EVENTS = {
    DRAW: 0,
    CLEAR: 1,
    UNDO: 2,
    MESSAGE: 3,
    LIKE: 4,
    DISLIKE: 5,
    SELECT_WORD: 6,
    HINT: 7,
    LEAVE: 8,
    JOIN: 9,
    API: 10,
    SET_STATE: 11,
};

exports.MSG_STATUS = {
    NONE: 0,
    LIKE: 1,
    LIKED: 2,
    DIS: 3,
    DISSED: 4,
};

exports.WORD_TYPES = {
    NOUN: 0,
    VERB: 1,
    ADJ: 2,
};

exports.NET_EVENTS = {
    JOIN: 100,
    REJOIN: 101,
    LEAVE: 102,
    NOTIFICATION: 103,
    GAME_INFO: 104,
    NEW_USER: 105,
    USER_LEFT: 106,
    WORD_INFO: 107,
    GUESSED_RIGHT: 108,
};