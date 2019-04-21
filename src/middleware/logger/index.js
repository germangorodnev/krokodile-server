const { log } = require('~/helpers');

module.exports = async (ctx, next) => {
    const b = Date.now();
    await next();
    const a = new Date();
    const p = (ctx.status > 201) ? 'error' : 'mark';
    log[p](
        // a.toISOString().slice(0, 10) + ' ' + a.toLocaleTimeString(),
        ctx.method, 
        ctx.url, 
        ctx.status, 
        ((a.getTime() - b)) + 'ms'
    );
}