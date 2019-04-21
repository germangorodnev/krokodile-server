const connectDb = require('./db');
const config = require('./config');
const http = require('http');
const app = require('./server');
const { dbConfig, port, ip } = config;
const AppSocket = require('./server/socket');

(async () => {
    let server = null;
    try {
        const info = await connectDb(dbConfig);
        console.log(`Connected to ${info.host}:${info.port}/${info.name}`);
    } catch (error) {
        console.error('Unable to connect to database', error);
    }
    // launch the server
    server = http.createServer(app.callback()).listen(port, ip, () => {
        console.log(`Server is running on ${port}`);
    });

    // launch socketio server
    const server2 = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end("<h1>heheheheh</h1>")
    })
    AppSocket.init(server2);
    server2.listen(8000);
})();