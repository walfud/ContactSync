const http = require('http');
const fetch = require('node-fetch');
const querystring = require('querystring');

/**
 * return: oid: String
 */
function getOauthId(token) {
    const param = querystring.stringify({
        client_id: 'df33ecd49de1c42e7107845d3b1ae1a0', 
        token,
    });
    // return fetch(`http://oauth2.walfud.com/oid?${param}`)
    //     .then(async res => {
    //         const body = await res.text();
    //         try {
    //             const jsonBody = JSON.parse(body);
    //             return jsonBody.err !== null ? jsonBody.oid : jsonBody.message;
    //         } catch (err) {
    //             throw `${res.status} ${res.statusText}\n${res.url}\n${body}`;
    //         }
    //     });
    return Promise.resolve(token);
}

module.exports = {
    getOauthId,
}