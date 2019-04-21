const chai = require('chai');
const mongoose = require('mongoose');

const expect = chai.expect;
let TOKEN = null;
const { login, password } = require('../helper');
const email = 'germangorodnev@gmail.com';

module.exports = async(request) => {
    describe('Auth', () => {

        describe('Registration', async() => {
            it('should fail to authenticate user', async() => {
                await request.get('/user/me')
                    .expect(401);
            });

            it('should register user by username, pwd and email', async() => {
                const r = await request
                    .post('/auth/register')
                    .set('Content-Type', 'application/json')
                    .send({
                        username: login,
                        password: password,
                        email
                    })
                    .expect(201)
                expect(r.body).to.have.property('registered').equal(true);
            });

            it('should not register duplicate', async() => {
                const r = await request
                    .post('/auth/register')
                    .set('Content-Type', 'application/json')
                    .send({
                        username: login,
                        password: password,
                        email
                    })
                    .expect(409)
            });

            // it('should not login when email not confirmed [via email]', async () => {
            //     const r = await request
            //         .post('/auth/login')
            //         .set('Content-Type', 'application/json')
            //         .send({
            //             login: email
            //             password: password,
            //         })
            //         .expect(401)
            //     expect(r.body).to.have.property('error').equals('emailConfirm');
            // });

            // it('should not login when email not confirmed [via username]', async () => {
            //     const r = await request
            //         .post('/auth/login')
            //         .set('Content-Type', 'application/json')
            //         .send({
            //             login
            //             password,
            //         })
            //         .expect(401)
            //     expect(r.body).to.have.property('error').equals('emailConfirm');
            // });

            // it('should confirm email when opening the link', async () => {
            //     const r = await request
            //         .get(`/auth/confirmEmail?cid=${(await mongoose.model('User').findOne({ 'info.username': login }, { 'auth.emailCid': 1 }).exec()).auth.emailCid}`)
            //         .expect(200)
            //     expect(r.body).to.have.property('confirmed').equal(true);
            // });
        })

        describe('Login', () => {
            it('should not login when wrong username\\password', async() => {
                const r = await request
                    .post('/auth/login')
                    .set('Content-Type', 'application/json')
                    .send({
                        password: password + 'wrong',
                        login: login
                    })
                    .expect(401)
                expect(r.body).to.have.property('error').equals('invalid');
            });
            it('should login via username', async() => {
                const r = await request
                    .post('/auth/login')
                    .set('Content-Type', 'application/json')
                    .send({
                        login: login,
                        password: password,
                    })
                    .expect(200)
                expect(r.body).to.have.property('token').match(/.*\..*\..*/);
            });

            it('should login via email', async() => {
                const r = await request
                    .post('/auth/login')
                    .set('Content-Type', 'application/json')
                    .send({
                        login: email,
                        password: password,
                    })
                    .expect(200)
                expect(r.body).to.have.property('token').match(/.*\..*\..*/);
                TOKEN = r.body.token;
            });

            it('should get user on init', async() => {
                const r = await request
                    .get(`/auth/init`)
                    .set('Authorization', `Bearer ${TOKEN}`)
                    .expect(200)
                expect(r.body).to.have.property('user').have.property('info');
            });
        });
    });
};