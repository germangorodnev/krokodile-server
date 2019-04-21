const { onError } = require('~/helpers');

module.exports = async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        console.log('error!', err);
        onError(ctx, { error: err.message }, err.status || 500);
        ctx.app.emit('error', err, ctx);
    }
}