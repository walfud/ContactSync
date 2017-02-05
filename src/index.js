import express from 'express';
import bodyParser from 'body-parser';
import {graphql} from 'graphql';
import schema from './schema.js';


let app = express();
app.use(bodyParser.text({type: 'application/graphql'}));

app.post('/graphql', (req, res) => {
  graphql(schema, req.body).then((result) => {
    res.send(JSON.stringify(result));
  });
});

app.listen(3000, function() {
  console.log('start');
});

// nodemon -x "bash -c './node_modules/babel-cli/bin/babel-node.js --presets es2015 src/index.js'"

// mutation _ {
// 	login(email: "hi@walfud.com", password: "123456", client_id: "710b962e-041c-11e1-9234-0123456789ab")
// }

// mutation _ {
// 	set(_id: "5896c20417870c0a880defba", client_id: "710b962e-041c-11e1-9234-0123456789ab",  contacts: [{client_id: "fa1dd4f6-9f42-44b2-8588-4838f9a3f5fe", name: "china mobile", phone: "13800138000"}]) {
// 		_id,
// 		client_id,
// 		contacts {
// 			_id,
// 			client_id,
// 			phone,
// 		}
// 	}
// }

// query _ {
// 	me(_id: "5896c20417870c0a880defba") {
// 		_id,
// 		client_id,
// 		contacts {
// 			_id,
// 			client_id,
// 			phone,
// 		}
// 	}
// }
