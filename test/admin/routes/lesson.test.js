const chai = require('chai');
chai.use(require('chai-things'));
const expect = chai.expect;
const { getToken } = require('../config');
const TITLE = 'lesson #1';
const LESSON_INDEX = 1;
const COURSE_INDEX = 2;
const NUMBER_OF_TASKS = 1;
const DESCRIPTION = 'HEHE it is lesson number 1';
const TITLE_U = TITLE + '_updated';
const TEXT = 'generic text';
const TEXT_U = 'better text';
const DESCRIPTION_U = DESCRIPTION + '_updated';
let lesson = null;
const { log } = require('~/helpers');
const mongoose = require('mongoose');

const { createTask, authenticate } = require('~/../test/api/helper');

const { TASK_TYPES } = require('~/helpers/constants');
const { TASK_TEST } = require('~/../test/tasks');

module.exports = async(request) => {
    describe('Lesson', () => {
        // authenticate
        before(async() => {
            TOKEN = await getToken(request);
            taskid = await createTask('TASK_TEST');
            taskid2 = await createTask('TASK_MAZE');
        });

        it('should create lesson', async() => {
            const r = await request
                .post('/lesson/create')
                .set('Authorization', TOKEN)
                .set('Content-Type', 'application/json')
                .send({
                    title: TITLE,
                    description: DESCRIPTION,
                    courseIndex: COURSE_INDEX,
                    lessonIndex: LESSON_INDEX
                })
                .expect(201);
            expect(r.body.lesson).to.include({
                title: TITLE,
                description: DESCRIPTION,
                courseIndex: COURSE_INDEX,
                lessonIndex: LESSON_INDEX
            });
            lesson = r.body.lesson._id;
        });

        it('should get all lessons', async() => {
            const r = await request
                .get('/lesson/all')
                .set('Authorization', TOKEN)
                .expect(200);
            expect(r.body.lessons).to.have.length(1);
        });

        it('should get only one lesson', async() => {
            const r = await request
                .get(`/lesson/${lesson}`)
                .set('Authorization', TOKEN)
                .expect(200);
            expect(r.body.lesson).to.have.property('_id').eqls(lesson);
        });

        it('should update a lesson', async() => {
            const r = await request
                .put(`/lesson/${lesson}`)
                .set('Authorization', TOKEN)
                .send({
                    title: TITLE_U,
                    description: DESCRIPTION_U,
                    pages: [{ text: 'yr mom approves' }]
                })
                .expect(200);
            expect(r.body.lesson).to.include({
                title: TITLE_U,
                description: DESCRIPTION_U,
            });

        });


        it('should add a page', async() => {
            const r = await request
                .put(`/lesson/${lesson}/addPage`)
                .set('Authorization', TOKEN)
                .set('Content-Type', 'application/json')
                .send({
                    text: TEXT,
                    needToComplete: NUMBER_OF_TASKS,
                    tasks: [taskid2]
                })
                .expect(200);
            expect(r.body.lesson.pages).to.have.length(1);
            pageid = r.body.lesson.pages[0]._id;
        });

        it('should update a page text', async() => {
            const r = await request
                .put(`/page/${pageid}/text`)
                .set('Authorization', TOKEN)
                .set('Content-Type', 'application/json')
                .send({
                    text: TEXT_U,
                })
                .expect(200);
            expect(r.body.lesson.pages[0]).to.have.property("text").eqls(TEXT_U);
        });


        it('should add a task to a page', async() => {
            const r = await request
                .put(`/page/${pageid}/addTask`)
                .set('Authorization', TOKEN)
                .set('Content-Type', 'application/json')
                .send({ taskId: taskid })
                .expect(200);
            r.body.lesson.pages.find(f => f._id === pageid).tasks.should.contain.an.item.with.property('_id', taskid)
                // expect(r.body.lesson.pages.find(f => f._id === pageid).tasks).to.satisfy(t => {
                //     let foundid = false;
                //     console.log(taskid);
                //     t.forEach(e => {
                //         console.log(e._id);
                //         if (e._id === taskid) {
                //             foundid = true;
                //         }
                //     });
                //     return foundid;
                // })
            expect(r.body.lesson.pages.find(f => f._id === pageid).tasks[1]).to.have.property("type").eqls('test');
        });

        it('should get all pages of a lesson', async() => {
            const r = await request
                .get(`/lesson/${lesson}/all`)
                .set('Authorization', TOKEN)
                .expect(200);

        });

        it('should delete task by id', async() => {
            const r = await request
                .delete(`/page/${pageid}/removeTask/${taskid}`)
                .set('Authorization', TOKEN)
                .expect(200);
            r.body.lesson.pages.find(f => f._id === pageid).tasks.should.not.contain.an.item.with.property('_id', taskid)
        })

        it('should delete page by id', async() => {
            const r = await request
                .delete(`/page/${pageid}/deletePage`)
                .set('Authorization', TOKEN)
                .expect(200);
            expect(r.body.lesson.pages.find(f => f._id === pageid)).to.be.undefined;
        })

        it('should delete lesson by id', async() => {
            const r = await request
                .delete(`/lesson/${lesson}`)
                .set('Authorization', TOKEN)
                .expect(200);
            expect(r.body).to.have.property('success').eqls(true);
        })

    })
};