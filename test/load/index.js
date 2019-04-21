require('module-alias/register');
process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');
const app = require('~/server');
const connectDatabase = require('~/db');
const config = require('~/config');
const log = require('color-log');
const ac = require('autocannon');
const chai = require('chai');
chai.should();
const PORT = 3000;
describe('Application API', () => {
    before(async () => {
        app.listen(PORT);
        await connectDatabase(config.dbConfigTest);

        for (let model of Object.keys(mongoose.models)) {
            await mongoose.model(model).deleteMany({});
        }
    });
    it('should end autocannon', async () => {
        const cc = () => {
            return new Promise((res, rej) => {
                const instance = ac({
                    url: `http://localhost:${PORT}/api/v1/auth/register`,
                    method: 'POST',
                    connections: 100, 
                    pipelining: 1, 
                    duration: 15, 
                    idReplacement: true,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "username": "test_[<id>]",
                        "password": "pwdw",
                    })
                }, (err, result) => {
                    if (err)
                        return log.error(err);
                    log.mark(result);
                    res(true);
                });
                instance.on('response', handleResponse);
                function handleResponse(client, statusCode, resBytes, responseTime) {
                    // console.log(`Got response with code ${statusCode} in ${responseTime} milliseconds`)
                    // console.log(`response: ${resBytes.toString()}`)
                }
            })
        }
        await cc();
    })
});