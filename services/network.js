const http = require('http');
const fetch = require('node-fetch');
const querystring = require('querystring');

function getOauthId(token, refreshToken) {
    const param = querystring.stringify({
        client_id: 'df33ecd49de1c42e7107845d3b1ae1a0', 
        token,
        refresh_token: refreshToken,
    });
    return fetch(`http://oauth2.walfud.com/oid?${param}`)
        .then(async res => {
            try {
                return await res.json();
            } catch (err) {
                throw `${res.status}: ${res.statusText}\n${res.url}`;
            }
        });
}

module.exports = {
    getOauthId,
}