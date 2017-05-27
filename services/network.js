const http = require('http');
const fetch = require('node-fetch');
const querystring = require('querystring');

/**
 * return: oid: String
 */
async function getOauthId(token) {
    const response = await fetch(`http://oauth2.walfud.com/user`, {
        headers: {
            'X-Access-Token': token,
        }
    });
    const user = await res.json();
    return user.oid;
}

module.exports = {
    getOauthId,
}