const { EventEmitter } = require('events');
const { GAME_STATES, GAME_EVENTS, MSG_STATUS, WORD_TYPES, NET_EVENTS } = require('./consts');
const { createEvent } = require('./helpers');
const { log, sleep } = require('~/helpers');

class GameRoom extends EventEmitter {
    constructor(id, socket) {
        super();
        /**
         * @type {Object<String, SocketIOClient.Socket}
         */
        this.users = {};
        this.msgIndex = 0;
        this.state = GAME_STATES.CREATED;
        this.id = id;
        this.closed = false;
        /**
         * @type {SocketIO.Server}
         */
        this.socket = socket;
        /**
         * @type {SocketIO.Socket}
         */
        this.drawer = null;

        // generate words
        this.words = [{
            t: 0,
            w: 'собака'
        }, {
            t: 1,
            w: 'ходить'
        }, {
            t: 2,
            w: 'клевый'
        }];
        this.word = null;
        this.chat = [];
    }


    addUser(client) {
        if (Object.keys(this.users).length > 0) {
            // he's a guesser
            client.state.drawer = false;
        } else {
            // drawer
            log.mark('Set', client.state.username, 'as drawer');
            client.state.drawer = true;
            this.drawer = client;
        }
        this.users[client.state.id] = client;

        client.join(this.id, err => {
            if (err) {
                log.mark('ERROR ON CONNECT', client.state.username);
                return;
            }
            client.state.room = this.id;
            // client.state.roomObj = this;
            // this.startGame();

            if (client.state.drawer) {
                this.addMessage({
                    id: 'sys',
                    text: `${client.state.username} enters the room.`,
                });

                // send him the words
                client.send(createEvent(GAME_EVENTS.API, {
                    e: NET_EVENTS.GAME_INFO,
                    dr: true,
                    id: client.state.id,
                    w: this.words,
                    // chat history
                    ch: this.chat,
                }));
            } else {
                this.addMessage({
                    id: 'sys',
                    text: `${client.state.username} enters the room.`,
                });

                // send him all game info
                client.send(createEvent(GAME_EVENTS.API, {
                    e: NET_EVENTS.GAME_INFO,
                    dr: false,
                    id: client.state.id,
                    w: (this.word ? ({
                        t: this.word.t,
                    }) : undefined),
                    // all users
                    us: Object.keys(this.users)
                        // .filter(uid => uid !== client.state.id)
                        .map(uid => {
                            return {
                                id: uid,
                                un: this.users[uid].state.username,
                            }
                        }),
                    // chat history
                    ch: this.chat,
                }))
                // send new user event data to others
                this.sendToAll(createEvent(GAME_EVENTS.API, {
                    e: NET_EVENTS.NEW_USER,
                    u: {
                        id: client.state.id,
                        un: client.state.username,
                    }
                }));

            }
        })
    }

    checkAnswer(text) {
        if (text.indexOf(this.word.w) > -1) {
            // what a lucky guy
            // emit that winned
            this.sendToAll(createEvent(GAME_EVENTS.API, {
                e: NET_EVENTS.GUESSED_RIGHT,
                w: this.word.w,
                // u: {
                //     id: client.state.id,
                //     un: client.state.username,
                // }
            }));
            // close
            setImmediate(() => {
                this.close();
            });
        }
    }

    nextMessageIndex() {
        return (++this.msgIndex);
    }

    removeUser(userId) {
        if (this.closed) return;
        const user = this.users[userId];
        if (user) {
            delete this.users[userId];
            if (user.state.drawer) {
                // game is over
                this.close();
            } else {
                if (Object.keys(this.users).length === 0) {
                    // remove room
                    this.close();
                } else {
                    // save message
                    // emit leaving
                    this.sendToAll(createEvent(GAME_EVENTS.API, {
                        e: 106,
                        id: userId,
                    }));
                    this.addMessage({
                        id: 'sys',
                        text: `${user.state.username} left.`,
                    });
                }
            }
        }
    }


    sendToAll(event) {
        this.socket.in(this.id).send(event);
    }

    addMessage(msg) {
        this.chat.push(msg);
    }

    likeDisMessage(index, like) {
        const m = this.chat.find(m => m.i === index);
        if (m) {
            const [set1, set2] = like ? [
                MSG_STATUS.LIKE, MSG_STATUS.LIKED
            ] : [
                    MSG_STATUS.DIS, MSG_STATUS.DISSED
                ];

            switch (m.l) {
                case MSG_STATUS.NONE:
                    m.l = set1;
                    break;
                case MSG_STATUS.LIKE:
                    if (like)
                        m.l = set2;
                    else
                        m.l = set1;
                    break;
                case MSG_STATUS.DIS:
                    if (like)
                        m.l = set1;
                    else
                        m.l = set2;
                    break;
                case MSG_STATUS.LIKED:
                case MSG_STATUS.DISSED:
                    m.l = set1;
                    break;
                default:
                    m.l = set1;
            }
        }
    }

    selectWord(index) {
        if (this.state > GAME_STATES.SELECTING_WORD) return;
        this.state = GAME_STATES.PLAYING;
        this.word = this.words[index];
        // emit to all other players
        // emit set state to drawer
        const msgToGuesser = createEvent(GAME_EVENTS.API, {
            e: NET_EVENTS.WORD_INFO,
            t: this.word.t
        });
        this.drawer.broadcast.to(this.id).send(msgToGuesser);
        this.drawer.send(createEvent(GAME_EVENTS.SET_STATE, [GAME_STATES.PLAYING]));
    }

    close() {
        if (this.closed) return;
        // emit to all game end
        log.error('Closing', this.id);
        for (let uid in this.users) {
            /**
             * @type {SocketIOClient.Socket}
             */
            const user = this.users[uid];
            if (user.close)
                user.close();
        }
        this.chat = null;
        this.users = null;
        this.closed = true;
        this.emit('closed', this.id);
    }

    startGame() {
        if (this.state === GAME_STATES.CREATED) {
            // tell all clients
            this.setState(GAME_STATES.SELECTING_WORD);
            let arr = [
                11, // set state

            ];
            // send words to player
            // send trigger of start to others
            const msgToDrawer = createEvent(GAME_EVENTS.API, {
                e: 104,

            });
            const msgToGuesser = createEvent(GAME_EVENTS.API, {
                e: 104,
            });
            for (const ui in this.users) {
                /** @type {SocketIOClient.Socket} */
                const user = this.users[ui];
                if (user.state.drawer) {
                    user.send(msgToDrawer);
                } else {
                    user.send(msgToGuesser);
                }
            }
        }
    }

    setState(newstate) {
        this.state = newstate;
        // send info to all users
    }


}

module.exports = GameRoom;