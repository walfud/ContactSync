const fetch = require('node-fetch');
const Router = require('koa-router');

const router = new Router();

/**
 * 转发给认证服务器
 */
router.post('/cb', async (cxt, next) => {
    cxt.body = await fetch('http://localhost:48906/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': cxt.request.header['x-access-token'],
        },
        body: JSON.stringify(cxt.request.body),
    })
        .then(res => res.text());
});

module.exports = router;