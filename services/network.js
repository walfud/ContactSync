const http = require('http');
const fetch = require('node-fetch');
const querystring = require('querystring');

/**
 * return: oid: String
 */
function getOauthId(token) {
    return fetch(`http://oauth2.walfud.com/oid?${token}`)
        .then(async res => {
            const body = await res.text();
            try {
                const jsonBody = JSON.parse(body);
                return jsonBody.err ? jsonBody.oid : jsonBody.message;
            } catch (err) {
                throw `${res.status} ${res.statusText}\n${res.url}\n${body}`;
            }
        });
}

module.exports = {
    getOauthId,
}