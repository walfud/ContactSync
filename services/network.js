const http = require('http');
const fetch = require('node-fetch');

const OAUTH2_URL = process.env.OAUTH2_URL;

/**
 * return: oid: String
 */
async function fetchOid(token) {
    const response = await fetch(`${OAUTH2_URL}/user`, {
        headers: {
            'X-Access-Token': token,
        }
    });
    const user = await response.json();
    return user.oid;
}

module.exports = {
    fetchOid,
    OAUTH2_URL,
}
