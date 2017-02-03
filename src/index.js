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


// query _ {
// 	me(_id: "") {
// 		_id,
// 		contacts {
// 			_id,
// 			phone,
// 		}
// 	}
// }

// mutation _ {
// 	set(_id: "b", contacts: [{phone: "b.1"}]) {
// 		_id,
// 		contacts {
// 			_id,
// 			phone,
// 		}
// 	}
// }
