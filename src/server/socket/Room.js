const { EventEmitter } = require('events');
const { GAME_STATES, ROLES, MSG_STATUS } = require('./consts');
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
                client.send(createEvent(10, {
                    e: 104,
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
                client.send(createEvent(10, {
                    e: 104,
                    dr: false,
                    id: client.state.id,
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
                this.sendToAll(createEvent(10, {
                    e: 105,
                    u: {
                        id: client.state.id,
                        un: client.state.username,
                    }
                }));

            }
        })
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
                    this.sendToAll(createEvent(10, {
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
                case MSG_STATUS.DIS:
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
            const msgToDrawer = createEvent(10, {
                e: 104,

            });
            const msgToGuesser = createEvent(10, {
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