'use strict';

require('module-alias/register');
const app = require('lib/app');

module.exports.example = async (event, context, callback) => {
    const request = app.request({ context, event, callback });
    try {
        const user = request.getUser();
        const data = { user };
        return request.response({ data, code: 200 });
    } catch (error) {
        request.error({ error });
    }
};