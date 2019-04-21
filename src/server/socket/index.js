const io = require('socket.io')
const { log } = require('~/helpers');
const userByToken = require('./userByToken');

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

        this.users = [];
        this.handleEvent = {
            auth: this.auth.bind(this),
            join: this.join.bind(this),
            leave: this.leave.bind(this),
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
            // should join room
            client.join('test');

            client.on('message', async (data) => {
                // const d = new ArrayBuffer(data);
                log.mark('New message from client');
                // if (client.state.auth !== true) {
                //     if (data.type !== 'auth') {
                //         return client.send({
                //             type: data.type,
                //             success: false,
                //             error: 'auth'
                //         });
                //     }
                // }
                // decode
                const decoded = this.decode(data);
                this.handle(decoded[0], decoded.slice(1));
                // emit event
                this.socket.to('test').send(data);
                // await this.handleEvent[event.type](client, event)
            });

            client.on('disconnect', async () => {
                
                // log.error('Client has disconnected');
            });
        });
    }

    decode(data) {
        return new Uint8Array(data);
    }

    /////////////////////////////////////////////// Event handlers /////////////////////////////////////////////
    async handle(type, data) {
        log.mark('event', type, 'payload', data.slice(0, 10));
    }

    async auth(client, event) {
        try {
            const user = await userByToken(event.token);
            if (user) {
                // client is authenticated
                client.state.auth = true;
                client.state.user = user;
                client.send({ type: 'auth', success: true });
            } else {
                this.onError(client, {
                    type: event.type,
                    error: e,
                });
            }
        } catch (e) {
            log.error('Error on client auth', e);
            this.onError(client, {
                type: event.type,
                error: e,
            });
        }
    }

    async leave(client, event) {
        this.queue = this.queue.filter(v => v.id !== client.id);
        client.send({ type: 'leaveArena', success: true });
        client.state.user.arena.inQueue = false;
        await client.state.user.save();
        log.mark(this.queue.length, 'now in queue');
    }

    async join(client, event) {
        // since client is authenticated, we have his id
        const { _id } = client.state.user;
        if (this.queue.some(v => v.state.user._id.toString() === _id.toString())) {
            return;
        };
        // update db document
        client.state.user.arena.inQueue = true;
        await client.state.user.save();

        this.queue.push(client);
        log.mark(this.queue.length, 'now in queue');
        client.send({ type: 'joinArena', success: true });
        if (this.matching) {
            this.needMatch = true;
        } else {
            clearTimeout(this.matchTimeout);
            this.matchTimeout = setTimeout(this.findOpponent, 1000 * 1);
        }
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
