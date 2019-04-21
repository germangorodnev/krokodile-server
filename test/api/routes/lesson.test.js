const chai = require('chai');
const expect = chai.expect;
let TOKEN = null;
let taskId = null;
const mongoose = require('mongoose');
const { createTask, authenticate } = require('../helper');
const { onSuccess, log } = require('~/helpers');

module.exports = async(request) => {
    describe('Lesson', () => {
        // authenticate
        before(async() => {
            TOKEN = await authenticate(request);
            taskId = await createTask('TASK_TEST');
            taskId2 = await createTask('TASK_MAZE');
            const lesson = await mongoose.model('Lesson').create({
                title: 'Good lesson',
                lessonIndex: 666,
                courseIndex: 1,
                description: 'A nice test lesson',
                exam: true,
                pages: [{
                    text: 'We are populating',
                    tasks: [taskId, taskId2],
                    needToComplete: 1,
                }],
            })
            lessonId = lesson._id;
            pageId = lesson.pages[0]._id;

        });


        it('should get a lesson/pages population', async() => {
            const r = await request
                .get(`/page/${pageId}/populate`)
                .set('Authorization', TOKEN)
                .expect(200);
            log.mark('rere', r.body);
        });

    });


};