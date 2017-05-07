# ContactSync

[TEST](http://localhost:51955/graphql)

Query
```graphql
query ($token: String!) {
  contacts(token: $token) {
    id
    name
    phone
  }
}
------------
variable
{
  "token": "oid1"
}
```
Mutation
```graphql
mutation ($token: String!, $contacts: [ContactInputType]!) {
  sync(token: $token, contacts: $contacts) {
    id
    name
    phone
  }
}
------------
variable
{
  "token": "oid1",
  "contacts": [{
    "name": "a",
    "phone": ["1"]
  },{
    "name": "b",
    "phone": ["2", "222"]
  }]
}
```