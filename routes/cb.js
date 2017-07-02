const Router = require('koa-router');
const fetch = require('node-fetch');
const querystring = require('querystring');

const {
    OAUTH2_URL,
} = require('../services/network');

const router = new Router();

/**
 * 转发给认证服务器
 */
router.get('/cb', async (cxt, next) => {
    const { code, state } = querystring.parse(cxt.request.url.substr(cxt.request.url.indexOf('?') + 1))
    cxt.body = await fetch(`${OAUTH2_URL}/token`, {
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'x-access-token': cxt.request.header['x-access-token'],
        },
        body: querystring.stringify({
            grant_type: 'authorization_code',
            client_id: 'contactsync',
            redirect_uri: '',
            code,
        }),
    })
        .then(res => res.text());
});

module.exports = router;