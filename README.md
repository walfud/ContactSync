# ContactSync

[TEST](http://localhost:3000/graphql)

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
    "phone": "11"
  },{
    "name": "b",
    "phone": "22ccccc2222"
  }]
}
```