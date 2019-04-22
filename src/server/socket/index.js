const io = require('socket.io')
const { log, sleep } = require('~/helpers');

const uuidv4 = require('uuid/v4');
let ri = 1;
const uuid = () => {
    return `Room${ri++}`.toString();
}
const GameRoom = require('./Room');
const { GAME_STATES, GAME_EVENTS } = require('./consts');
const { ab2str, stringToArray, createEvent } = require('./helpers');

const onError = (client, payload) => {
    client.send({
        success: false,
        ...payload
    });
}

// This arena is only capable of matching suitable players agains each other, nothing more
class AppSocket {
    constructor(server) {
        this.socket = io.listen(server, {
        });

        this.users = {};
        /**
         * @type {Object<string, GameRoom>}
         */
        this.rooms = {};

        this.handleEvent = {
        }

        this.matching = false;
        this.matchTimeout = null;
        this.needMatch = false;

        // bindings
        // this.findOpponent = this.findOpponent.bind(this);

        this.start();
    }
    start() {
        this.socket.on('connection', (client) => {
            // log.mark('New client!');
            client.state = {};

            client.join('test', err => {
                if (err) {
                    log.mark('ERROR ON CONNECT', client.id);
                    return;
                }
                client.state.room = 'test';
            });

            client.on('join', async () => {
                // should join room
                log.warn(client.state.username, 'joins');
                const [room] = await this.findRoomOrCreate(client);
                log.mark('room is', room.id);
                if (room) {
                    // good 
                    room.addUser(client);
                }
            })

            client.on('message', async (data) => {
                // const d = new ArrayBuffer(data);
                log.mark('New message from client');
                if (client.state.auth !== true) {
                    if (typeof data === 'object') {
                        // this can only be auth
                        if (data.type !== 'auth') {
                            return client.send({
                                type: data.type,
                                success: false,
                                error: 'auth'
                            });
                        } else {
                            this.auth(client, data);
                            return;
                        }
                    }
                }
                // decode
                const decoded = this.decode(data);
                this.handle(decoded[0], decoded.slice(1));

                // modify in some cases
                switch (decoded[0]) {
                    case GAME_EVENTS.MESSAGE: {
                        let msg = decoded.slice(1);
                        // console.log(msg);
                        let ab = createEvent(decoded[0], [
                            Array.from(msg.slice(1, msg.length - 1)),
                            stringToArray(client.state.id),
                        ]);
                        client.broadcast.to(client.state.room).emit('message', ab);
                        break;
                    }
                    default: {
                        client.broadcast.to(client.state.room).emit('message', data);
                    }
                }
            });

            client.on('disconnect', async () => {
                log.error('Client has disconnected', client.state);
                // remove from thingy
                const r = this.rooms[client.state.room];
                if (r) {
                    r.removeUser(client.state.id);
                }
            });
        });
    }

    decode(data) {
        return new Uint8Array(data);
    }

    createRoom(roomId) {
        roomId = roomId || uuid();
        const r = new GameRoom(roomId, this.socket);
        this.rooms[r.id] = r;
        return r;
    }

    /**
     * 
     * @returns {GameRoom} 
     */
    async findRoomOrCreate(client) {
        let found = null;
        // log.mark("I have", Object.keys(this.rooms).length);
        for (const roomId in this.rooms) {
            const room = this.rooms[roomId];
            if (Object.keys(room.users).length < 5
                && room.state < GAME_STATES.FINISHED) {
                // add user to it 
                return [room, false];
                break;
            }
        }
        // if (found !== null) {
        //     return found;
        // }
        // create new room
        // wait for a bit
        if (Object.keys(this.rooms).length !== 0) {
            await sleep(1000 * .5);
        }
        const room = this.createRoom();
        // log.mark('created room', this.rooms);
        return [room, true];
    }

    /////////////////////////////////////////////// Event handlers /////////////////////////////////////////////
    async handle(type, data) {
        log.mark('event', type, 'payload', data.slice(0, 10));
    }

    async auth(client, event) {
        client.state.auth = true;
        client.state.username = event.username;
        client.state.id = uuidv4();
        client.emit('auth', { success: true });
    }

    /////////////////////////////////////////////// [END] Event handlers /////////////////////////////////////////////

    async findOpponent() {
        log.warn('Starting to find');
        this.matching = true;
        const b = Date.now();
        const { queue } = this;
        for (let i = 0; i < queue.length - 1; i += 2) {
            const [u1, u2] = [queue[i], queue[i + 1]];
            // match them
            log.mark('Matching', u1.state.user.info.username, 'vs', u2.state.user.info.username);
            // send them to unique room

            const room = await ArenaController.createRoom([u1, u2].map(s => s.state.user));

            // send to both users new room' id
            u1.send({
                type: 'opponentFound',
                room: room,
                opponent: u2.state.user.info,
            });
            u2.send({
                type: 'opponentFound',
                room: room,
                opponent: u1.state.user.info,
            });

            // remove'em
            this.queue.splice(i, 2);
            i -= 2;
        }

        log.warn('Finished in', (Date.now() - b) + 'ms.');
        log.warn(this.queue.length, 'now in queue');
        this.matching = false;
        if (this.needMatch) {
            this.needMatch = false;
            clearTimeout(this.matchTimeout);
            this.matchTimeout = setTimeout(this.findOpponent, 1000 * 1.7);
        }
    }

    notifyEvent() {

    }
}


let instance = null;
module.exports = {
    get() {
        return instance;
    },
    init(server) {
        instance = new AppSocket(server);
    }
} 
