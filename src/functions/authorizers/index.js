'use strict';

import auth from '../../../lib/auth';
import { env } from '../../lib';

const generatePolicy = (principalId, Resource) => {
    return {
        principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [{
                Action: 'execute-api:Invoke',
                Effect: 'allow',
                Resource
            }]
        }
    };
};

export async function basic(event) {
    const token = event.authorizationToken || false;
    let error = 'Unauthorized';
    if (token !== false) {
        const user = auth.getUser(token);
        const userRoles = user.roles || [];
        const resourceRoles = auth.parseRoles(env.AUTH_ROLES);
        if (auth.isAuth(userRoles, resourceRoles)) {
            return generatePolicy(JSON.stringify(user), event.methodArn);
        } else {
            error = 'Forbidden';
        }
    }
    throw new Error(error);
}