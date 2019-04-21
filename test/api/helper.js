require('module-alias/register');
const mongoose = require('mongoose');
const tasks = require('~/../test/tasks');

exports.sleep = ms => new Promise(res => setTimeout(res, ms));
exports.login = 'dima';
exports.password = '123';
exports.authenticate = async(request) => {
    const rl = (await request
        .post('/auth/login')
        .set('Content-Type', 'application/json')
        .send({
            login: exports.login,
            password: exports.password,
        })).body;
    return `Bearer ${rl.token}`;
}
exports.createTask = async(tn) => {
    return (await mongoose.model('Task').create(tasks[tn]))._id.toString();
}
exports.createCourses = async(n) => {
    for (let i = 1; i <= n; ++i) {
        await mongoose.model('Course').create({
            courseIndex: i,
            title: `Course #${i}`,
            description: `This is sample course #${i}`,
        });
    }
}