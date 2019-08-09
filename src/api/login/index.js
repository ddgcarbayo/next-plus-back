'use strict';

require('module-alias/register');
const app = require('lib/app');
const auth = require('lib/auth');

module.exports.login = async (event, context, callback) => {
    const request = app.request({ context, event, callback });
    try {
        const body = request.body;
        let user = null;
        if (body.token) { // login google
            user = await auth.getUserFromGoogle(body.token);
        } else if (body.image) { // login facial
            user = await auth.getUserByPhoto(body.image);
        } else {
            throw new Error('Invalid User');
        }
        const token = auth.generateToken(user);
        request.response({ 
            code: 200,
            data: { token, user }
        });
    } catch (error) {
        request.error({ error: new Error('Invalid User') });
    }
};

module.exports.addFace = async (event, context, callback) => {
    const request = app.request({ context, event, callback });
    try {
        const user = await request.getUser();
        const body = request.body;
        const image = body.image;
        await auth.saveFace({ image, user });
        request.response({ 
            code: 202,
            data: {}
        });
    } catch (error) {
        request.error({ error });
    }
};