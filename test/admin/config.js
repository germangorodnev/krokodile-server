exports.login = 'admin_test';
exports.password = 'admin_password';
exports.getToken = async (request) => {
    const { token } = (await request
        .post('/auth/login')
        .set('Content-Type', 'application/json')
        .send({
            login: exports.login,
            password: exports.password
        })).body;
    return `Bearer ${token}`;
};