const Koa = require('koa');
const logger = require('koa-logger')
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');

const index = require('./routes/index');
const graphql = require('./routes/graphql');

const app = new Koa();

app.use(logger());
app.use(bodyParser());

app.use(index.routes());
app.use(graphql.routes());

app.listen(51955);
