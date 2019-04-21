const Koa = require('koa');

const middleware = require('~/middleware');
const routes = require('~/routes');

const app = new Koa();

app.use(middleware());
app.use(routes());
app.use(ctx => { ctx.status = 404 });

module.exports = app;