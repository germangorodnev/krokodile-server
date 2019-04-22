const logger = require('color-log');

const emailRegex = /^.+\@.+\..+$/i;

exports.emailValid = email => {
    return emailRegex.test(email);
}

const arraysEqual = (a, b) => {
    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i])
            return false;
    }
    return true;
}

exports.arraysAlike = (a, b) => {
    return arraysEqual(a.sort(), b.sort());
}

exports.arraysIntersection = (guess, correct) => {
    if (guess.length > correct.length) {
        return [];
    }  
    return guess.filter(v => correct.includes(v));
}
exports.arraysEqual = arraysEqual;

exports.jsonParser = async (ctx, next) => {
    if (ctx.request.type === 'application/json') {
        try {
            // parse the body
            ctx.request.body = JSON.parse(await rawBody(ctx.req, {
                encoding: true,
            }));
        } catch (e) { }
    }
    return next();
}

exports.sleep = ms => new Promise(res => setTimeout(res, ms));

exports.log = {
    info: (...msg) => {
        logger.info(...msg);
    },
    warn: (...msg) => {
        logger.warn(...msg);
    },
    error: (...msg) => {
        logger.error(...msg);
    },
    mark: (...msg) => {
        logger.mark(...msg);
    },
}

exports.onSuccess = async (ctx, payload = {}, status = 200) => {
    const o = { success: true, ...(payload || {}) };
    ctx.body = JSON.stringify(o);
    ctx.status = status;
    ctx.type = 'application/json';
}

exports.onError = async (ctx, payload, status = 500) => {
    const o = { success: false, ...(payload || {}) };
    ctx.body = JSON.stringify(o);
    ctx.status = status;
    ctx.type = 'application/json';
}
