const chai = require('chai');
const expect = chai.expect;
let TOKEN = null;
let taskId = null;
const { createTask, authenticate } = require('../helper');

module.exports = async (request) => {
    describe('Task "Test"', () => {
        // authenticate
        before(async () => {
            TOKEN = await authenticate(request);
            taskId = await createTask('TASK_TEST');
        });
        it('should check task', async () => {
            const r = await request
                .post('/task/check')
                .set('Authorization', TOKEN)
                .set('Content-Type', 'application/json')
                .send({
                    attempt: {
                        answers: [
                            [2],
                            ['коммутативен'],
                            [1, 2, 3]
                        ]
                    },
                    taskId,
                })
                .expect(200)
            console.log(r.body);
        });

    });

    describe('Task "Maze"', () => {
        // authenticate
        before(async () => {

            taskId = await createTask('TASK_MAZE');
        });
        it('should check task', async () => {
            const r = await request
                .post('/task/check')
                .set('Authorization', TOKEN)
                .set('Content-Type', 'application/json')
                .send({
                    attempt: {
                        answer: [...Array(7).fill('r'), ...Array(2).fill('d'), 'l']
                    },
                    taskId,
                })
                .expect(200)
            console.log(r.body);
        });
    });
};