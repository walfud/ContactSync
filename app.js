const Koa = require('koa');
const logger = require('koa-logger')
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');


const app = new Koa();

app.use(logger());
app.use(bodyParser());

app.use(require('./routes/index').routes());
app.use(require('./routes/cb').routes());
app.use(require('./routes/graphql').routes());

app.listen(51955);
