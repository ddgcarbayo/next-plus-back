const Log = require('../log');
const uuid = require('uuid/v1');
const customHeaders = {
    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,PATCH,DELETE',
    'Access-Control-Allow-Origin': '*'
};

module.exports = class Request {
    constructor ({ context, event, callback }) {
        context.callbackWaitsForEmptyEventLoop = false;
        this._context = context;
        this._event = event;
        this._callback = callback;
        this._id = uuid();
        this.log = new Log(this);
        this._date = new Date();
        this._parseEvent();
        this._user = null;
        this.log.info({ msg: 'Start request' });
    }

    id () {
        return this._id;
    }

    async _setUser () {
        if (this._user === null) {
            try {
                // las funciones auth añaden el usuario al contexto
                return JSON.parse(this._event.requestContext.authorizer.principalId);
            } catch (e) {
                this._user = null;
            }
        }
    }


    async getUser () {
        await this._setUser();
        if (this._user !== null) {
            return this._user;
        } else {
            throw new Error('User Not Logged');
        }
    }

    // se podrían hacer cosas de roles
    isAuth (auth = {}) {
        return (this._user !== null);
    }

    error({ error, msg, code }) {
        const out = this._getErrorCode(error);
        if (msg !== undefined) {
            out.message = msg;
        }
        if (code !== undefined) {
            out.code = code;
        }
        this.log.error({ error });
        this._callback(null, {
            headers: customHeaders,
            statusCode: out.code,
            body: JSON.stringify(out)
        });
    }

    _getErrorCode (error = {}) {
        const message = error.message || error.name;
        switch (message) {
            case 'Invalid User':
                return { code: 403, message };
            case 'User Not Logged':
                return { code: 401, message };
            default:
                return { code: 500, message: 'Internal error' };
        }
    }

    _parseEvent () {
        const event = this._event || {};
        this.query = event.queryStringParameters || {};
        if (event.body) {
            try {
                this.body = JSON.parse(event.body);
            } catch (e) {
                this.body = event.body;
            }
        }
        this.headers = event.headers || {};
        this.params = event.pathParameters || {};
    }

    response({ data = false, code = 200, count = false, msg = false }) {
        try {
            // pillar token si hay y poner en headers
            const out = {};
            if (count !== false) {
                out.count = count;
            }
            if (data !== false) {
                out.data = data;
            }
            if (msg !== false) {
                out.message = msg;
            }
            this._callback(null, {
                headers: customHeaders,
                statusCode: code,
                body: JSON.stringify(out)
            });
        } catch (error) {
            this.error({ error });
        }
    }

    getUserId () {
        return this._user.email;
    }

    getTime () {
        return this._date.getTime();
    }
};