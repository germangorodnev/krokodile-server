require('module-alias/register');
process.env.NODE_ENV = 'test';

const supertest = require('supertest');
const prefix = require('supertest-prefix').default;
const defaults = require('superagent-defaults');

const mongoose = require('mongoose');
const chai = require('chai');
const app = require('~/server');
const connectDatabase = require('~/db');
const config = require('~/config');
const fs = require('fs');

const apiPrefix = prefix('/api/admin');
const request = defaults(supertest.agent(app.listen()));
request.use(apiPrefix);
chai.should();

describe('Admin API', () => {
    before(async () => {
        await connectDatabase(config.dbConfigTest);

        for (let model of Object.keys(mongoose.models)) {
            await mongoose.model(model).deleteMany({});
        }
    });

    const routes = fs.readdirSync(`${config.root}/test/admin/routes/`);
    routes.forEach(name => require(`${config.root}/test/admin/routes/${name}`)(request));
});