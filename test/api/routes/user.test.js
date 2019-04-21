const chai = require('chai');
chai.use(require('chai-things'));
const { should, expect } = chai;
const { authenticate } = require('../helper');

let TOKEN = null;

module.exports = async (request) => {
    describe('User', () => {
        before(async () => {
            TOKEN = await authenticate(request);
        });

        describe('Courses', async () => {
            it('should return all courses progress for dashboard', async () => {
                const { body } = await request
                    .get('/course/dashboard')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', TOKEN)
                    .expect(200)
                expect(body).to.have.property('courses').to.have.length(3);
                body.courses.should.all.have.property('lessonsDone', 0);
            });
            it('should return single course progress along with lesson list', async () => {
                const { body } = await request
                    .get('/course/1/lessons')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', TOKEN)
                    .expect(200)
                console.log(body);
                // expect(body).to.have.property('courses').to.have.length(3);
                // body.courses.should.all.have.property('lessonsDone', 0);
            })
        })
    });
};