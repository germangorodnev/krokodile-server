const chai = require('chai');
const { login, password } = require('../config');
const expect = chai.expect;

module.exports = async (request) => {
    describe('Auth', () => {
        it('should register user by username and password', async () => {
            const r = await request
                .post('/auth/register')
                .set('Content-Type', 'application/json')
                .send({
                    username: login,
                    password,
                })
                .expect(201)
            expect(r.body).to.have.property('registered').equal(true);
        });

        it('should authenticate by username and password', async () => {
            const r = await request
                .post('/auth/login')
                .set('Content-Type', 'application/json')
                .send({
                    login,
                    password
                })
                .expect(200)
            expect(r.body).to.have.property('token').match(/.*\..*\..*/);
        });
    });
};