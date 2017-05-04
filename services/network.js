const http = require('http');

function getOauthId(token, refreshToken) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('oid1');
        }, 1000);
    });
}

module.exports = {
    getOauthId,
}