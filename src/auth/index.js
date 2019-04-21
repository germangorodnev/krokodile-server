const passport = require('koa-passport');
const compose = require('koa-compose');
const jwt = require('jsonwebtoken');
const User = require('~/models/User');
const config = require('./config');
const { onSuccess, onError, log } = require('~/helpers');
// Strategies
const jwtStrategy = require('./strategies/jwt');

passport.use('jwt', jwtStrategy);

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser((id, done) => {
    (async () => {
        try {
            const user = await User.findById(id).lean().exec();
            done(null, user);
        } catch (error) {
            log.error('error', error);
            done(error);
        }
    })();
});

module.exports = () => {
    return compose([passport.initialize()]);
}

module.exports.isAuthenticated = async (ctx, next) => {
    await (passport.authenticate('jwt', async (err, user, ...rest) => {
        if (err) {
            onError(ctx, err, 401);
        } else if (!user) {
            onError(ctx, null, 401);
        } else {
            ctx.state.user = user;
            await next();
        }
    })(ctx, next));
}

// After autentication using one of the strategies, generate a JWT token
module.exports.generateToken = async (id) => {
    const jwtToken = jwt.sign({ id }, config.auth.secret);
    return jwtToken;
}

// Web Facebook Authentication
module.exports.isFacebookAuthenticated = () => {
    return passport.authenticate('facebook', {
        scope: ['email']
    });
}

module.exports.isFacebookAuthenticatedCallback = () => {
    return passport.authenticate('facebook', {
        failureRedirect: '/login'
    });
}


