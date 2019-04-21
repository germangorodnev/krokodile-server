const chai = require('chai');
const { getToken } = require('../config');
const expect = chai.expect;
chai.use(require("chai-sorted"));
const TITLE = 'master_course';
const DESCRIPTION = 'test_course';
const COURSE_INDEX = 1;

module.exports = async (request) => {
    describe('Course', () => {
        // authenticate
        before(async () => {
            TOKEN = await getToken(request);
        });

        it('should create course', async () => {
            const r = await request
                .post('/course/create')
                .set('Authorization', TOKEN)
                .set('Content-Type', 'application/json')
                .send({
                    title: TITLE,
                    description: DESCRIPTION,
                    courseIndex: COURSE_INDEX
                })
                .expect(201)
            expect(r.body.course).to.include({
                title: TITLE,
                description: DESCRIPTION,
                courseIndex: COURSE_INDEX
            });
        });


        it('should get all courses', async () => {
            await request
                .post('/course/create')
                .set('Authorization', TOKEN)
                .set('Content-Type', 'application/json')
                .send({
                    title: TITLE + "7",
                    description: DESCRIPTION,
                })
            await request
                .post('/course/create')
                .set('Authorization', TOKEN)
                .set('Content-Type', 'application/json')
                .send({
                    title: TITLE + "5",
                    description: DESCRIPTION,
                })
            const r = await request
                .get('/course/all')
                .set('Authorization', TOKEN)
                .expect(200);
            expect(r.body.courses).to.be.ascendingBy('courseIndex');
        });


        it('should update a course', async () => {
            const r = await request
                .put('/course/3')
                .set('Authorization', TOKEN)
                .set('Content-Type', 'application/json')
                .send({
                    title: TITLE + 'update',
                })
                .expect(200);
            expect(r.body.course).to.have.property("title").eqls(TITLE + 'update');
        });

        it('should delete course by courseIndex', async () => {
            const r = await request
                .delete(`/course/${COURSE_INDEX}`)
                .set('Authorization', TOKEN)
                .expect(200);
            expect(r.body).to.have.property('success').eqls(true);
        })

    })
};
