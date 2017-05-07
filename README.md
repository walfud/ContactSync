# ContactSync

[TEST](http://localhost:51955/graphql)

Query
```graphql
query ($token: String!) {
  contacts(token: $token) {
    id
    name
    phones
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
    phones
  }
}
------------
variable
{
  "token": "oid1",
  "contacts": [{
    "name": "a",
    "phones": ["1"]
  },{
    "name": "b",
    "phones": ["2", "222"]
  }]
}
```