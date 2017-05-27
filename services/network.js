const http = require('http');
const fetch = require('node-fetch');

/**
 * return: oid: String
 */
async function fetchOid(token) {
    const response = await fetch(`http://oauth2.walfud.com/user`, {
        headers: {
            'X-Access-Token': token,
        }
    });
    const user = await response.json();
    return user.oid;
}

module.exports = {
    fetchOid,
}
