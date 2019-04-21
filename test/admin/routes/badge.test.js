const chai = require('chai');
const root = require('~/config').root;
const { getToken } = require('../config');

const expect = chai.expect;

const TITLE = 'Badge #1';
const DESCRIPTION = 'HEHE XD';
let link = undefined;
let badge = undefined;
let TOKEN = null;
let badge_id = null;

module.exports = async(request) => {
    describe('Badge', () => {
        // authenticate
        before(async() => {
            TOKEN = await getToken(request);
        });


        it('should create badge', async() => {
            const r = await request
                .post('/badge/create')
                .set('Authorization', TOKEN)
                .set('Content-Type', 'application/json')
                .send({
                    title: TITLE,
                    description: DESCRIPTION,
                })
                .expect(201);
            expect(r.body.badge).to.include({
                title: TITLE,
                description: DESCRIPTION,
            });
            badge_id = r.body.badge._id;
        });

        it('should add a badge picture', async() => {
            const r = await request
                .put(`/badge/${badge_id}/icon`)
                .set('Authorization', TOKEN)
                .attach('icon', `${root}/test/images/badge.png`)
                .expect(200);
            expect(r.body.links).to.have.length(1);
        });

        it('should get all badges', async() => {
            const r = await request
                .get('/badge/all')
                .set('Authorization', TOKEN)
                .expect(200);
            expect(r.body.badges).to.have.length(1);
        });

        it('should update a badge', async() => {
            const r = await request
                .put(`/badge/${badge_id}`)
                .set('Authorization', TOKEN)
                .set('Content-Type', 'application/json')
                .send({
                    title: TITLE + 'update',
                })
                .expect(200);
            expect(r.body.badge).to.have.property('title').eqls(TITLE + 'update');
        });

        it('should delete badge by id', async() => {
            const r = await request
                .delete(`/badge/${badge_id}`)
                .set('Authorization', TOKEN)
                .expect(200);
            expect(r.body).to.have.property('success').eqls(true);
        })

    })
};