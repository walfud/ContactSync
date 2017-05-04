const Router = require('koa-router');
const graphqlHTTP = require('koa-graphql');

const schema = require('../graphql/schema');

const router = new Router();

/**
 * POST
 * /
 */
router.all('/graphql', graphqlHTTP({
  schema: schema,
  pretty: true,
  graphiql: true
}));

module.exports = router;