const jwt = require('jsonwebtoken');
const google = require('lib/google');
const secret = process.env.AUTH_SECRET;

class Auth {

    async getUserFromGoogle (token) {
        const data = await google.verify(token);
        if (data && data.email) {
            const domain = data.email.split('@')[1];
            if (domain !== 'bbva.com') {
                throw new Error('Not BBVA domaain');
            }
            return { email: data.email, name: data.name, avatar: data.picture };
        } else {
            throw new Error('Google invalid token');
        }
    }

    getUser (token) {
        return jwt.verify(token, secret);
    }

    parseRoles (text) {
        const arr = text.split(',');
        return arr.map(i => i.split());
    }

    generateToken (user) {
        return jwt.sign(user, secret);
    }

    isAuth (userRoles, resourceRoles) {
        // hacer lógica de perfilado
        return true;
    }

    async saveUserInfo (user) {
        const email = user.email;
        const Key = `${folderData}${email}.json`;
        const Body = JSON.stringify(user);
        // persistir donde toque
    }
}

module.exports = new Auth();