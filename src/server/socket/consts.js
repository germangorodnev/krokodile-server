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
    CHOOSE_WORD: 6,
    HINT: 7,
    LEAVE: 8,
    JOIN: 9,
    API: 10,
};

exports.MSG_STATUS = {
    NONE: 0,
    LIKE: 1,
    LIKED: 2,
    DIS: 3,
    DISSED: 4,
};