const compose = require('koa-compose');
const Router = require('koa-router');
const fs = require('fs');
const config = require('~/config');
const routerConfigs = [
    { folder: 'api', prefix: '/api/v1' }
];

const routes = () => {
    let composed = [];
    for (let curr of routerConfigs) {
        const Routes = fs.readdirSync(`${config.root}/src/routes/${curr.folder}`);
        const router = new Router({
            prefix: curr.prefix
        });

        for (let name of Routes) {
            const mm = require(`./${curr.folder}/${name}`);
            mm(router);
        }
        composed = [router.routes(), router.allowedMethods(), ...composed];
    }
    return compose(composed);
}


module.exports = routes;
module.exports = module.exports;