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
const { login, password, sleep, createCourses } = require('./helper');

const apiPrefix = prefix('/api/v1');
const request = defaults(supertest.agent(app.listen()));
request.use(apiPrefix);
chai.should();

describe('Application API', () => {
    before(async () => {
        await connectDatabase(config.dbConfigTest);
        for (let model of Object.keys(mongoose.models)) {
            await mongoose.model(model).deleteMany({});
        }
        // register
        await request
            .post('/auth/register')
            .set('Content-Type', 'application/json')
            .send({
                username: login,
                password,
                email: '1222w@2m2m.com',
            });
        // create courses
        await createCourses(3);
    });

    const routes = fs.readdirSync(`${config.root}/test/api/routes/`);
    routes.forEach(name => require(`${config.root}/test/api/routes/${name}`)(request));
});