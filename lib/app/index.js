const log = require('./log');
const axios = require('axios');
const Request = require('./request');

module.exports = {
    request (options) {
        return new Request(options);
    },
    error (name) {
        const e = new Error(name);
        e.name = name;
        return e;
    },
    log,
    axios
};