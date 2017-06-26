const Router = require('koa-router');
const fetch = require('node-fetch');

const {
    OAUTH2_URL,
} = require('../services/network');

const router = new Router();

/**
 * 转发给认证服务器
 */
router.post('/cb', async (cxt, next) => {
    cxt.body = await fetch(`${OAUTH2_URL}/token`, {
        method: 'POST',
        headers: {
            'content-type': cxt.request.header['content-type'],
            'x-access-token': cxt.request.header['x-access-token'],
        },
        body: cxt.request.rawBody,
    })
        .then(res => res.text());
});

module.exports = router;