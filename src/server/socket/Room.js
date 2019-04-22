const { EventEmitter } = require('events');
const { GAME_STATES, ROLES } = require('./consts');
const { createEvent } = require('./helpers');

class GameRoom extends EventEmitter {
    constructor(id, socket) {
        super();
        /**
         * @type {Object<String, SocketIOClient.Socket}
         */
        this.users = {};
        this.state = GAME_STATES.CREATED;
        this.id = id;
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
    }


    addUser(client) {
        if (Object.keys(this.users).length > 0) {
            // he's a guesser
            client.state.drawer = false;
        } else {
            // drawer
            client.state.drawer = true;
        }
        this.users[client.state.id] = client;

        client.join(this.id, err => {
            if (err) {
                log.mark('ERROR ON CONNECT', client.state.username);
                return;
            }
            client.state.room = this.id;
            // this.startGame();
            if (client.state.drawer) {
                // send him the words
                client.send(createEvent(10, {
                    e: 104,
                    dr: true,
                    w: this.words,
                    id: client.state.id,
                }))
            } else {
                // send him all game info
                client.send(createEvent(10, {
                    e: 104,
                    dr: false,
                    id: client.state.id,
                    us: Object.keys(this.users)
                        .filter(uid => uid !== client.state.id)
                        .map(uid => {
                            return {
                                id: uid,
                                un: this.users[uid].state.username,
                            }
                        })
                }))
                // send new user event data to others
                this.sendToAll(createEvent(10, {
                    e: 105,
                    id: client.state.id,
                    u: {
                        un: client.state.username,
                    }
                }));
            }
        })
    }

    removeUser(userId) {
        const user = this.users[userId];
        if (user) {
            delete this.users[userId];
            // emit leaving
            this.sendToAll(createEvent(10, {
                e: 106,
                id: userId,
            }));
        }
    }


    sendToAll(event) {
        this.socket.in(this.id).send(event);
    }


    close() {

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