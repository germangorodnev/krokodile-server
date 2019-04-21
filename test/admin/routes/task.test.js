const mongoose = require('mongoose');
const chai = require('chai');
const expect = chai.expect;
const { getToken } = require('../config');
const { TASK_TYPES } = require('~/helpers/constants');
const { TASK_TEST, TASK_MAZE } = require('~/../test/tasks');

module.exports = async(request) => {
    describe('Task', () => {
        // authenticate
        before(async() => {
            TOKEN = await getToken(request);
            testlesson = await mongoose.model('Lesson').create({
                title: "Test course X",
                description: "a description",
                lessonIndex: 66,
                courseIndex: 0,
                exam: false,
                pages: [{
                    text: 'xoxo',
                    tasks: [],
                    needToComplete: 1
                }]
            });

        });

        describe('Test', () => {

            it('should create test', async() => {
                const r = await request
                    .post('/task/create')
                    .set('Authorization', TOKEN)
                    .set('Content-Type', 'application/json')
                    .send(TASK_TEST)
                    .expect(201);
                const { task } = r.body;
                expect(task).to.include({
                    type: TASK_TYPES.TEST,
                });
                expect(task.info).to.have.length(TASK_TEST.info.length);
                expect(task.answer).to.have.property(TASK_TYPES.TEST).length(TASK_TEST.answer[TASK_TYPES.TEST].length);
                taskid = task._id;
            });

            it('should create maze with query', async() => {
                const r = await request
                    .post('/task/create')
                    .query({ page: `${testlesson.pages[0]._id}` })
                    .set('Authorization', TOKEN)
                    .set('Content-Type', 'application/json')
                    .send(TASK_MAZE)
                    .expect(201);
                const { task } = r.body;
                expect(task).to.include({
                    type: TASK_TYPES.MAZE
                });
            });

            it('should get all tasks', async() => {
                const r = await request
                    .get('/task/all')
                    .set('Authorization', TOKEN)
                    .expect(200);
                expect(r.body.tasks).to.be.ascendingBy('_id');
            });


            it('should update a task', async() => {
                const r = await request
                    .put(`/task/${taskid}`)
                    .set('Authorization', TOKEN)
                    .set('Content-Type', 'application/json')
                    .send(TASK_MAZE)
                    .expect(200);
                expect(r.body.task).to.include({
                    type: TASK_TYPES.MAZE,
                });
                expect(r.body.task).to.not.have.property('answer');

            });

            it('should delete task by id', async() => {
                const r = await request
                    .delete(`/task/${taskid}`)
                    .set('Authorization', TOKEN)
                    .expect(200);
                expect(r.body).to.have.property('success').eqls(true);
            })

        });

    })
};