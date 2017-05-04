const Router = require('koa-router');

const router = new Router();

/* GET home page. */
router.get('/', (cxt, next) => {
  cxt.body = 'Hello ContactSync';
});

module.exports = router;