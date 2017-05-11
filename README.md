# ContactSync

[TEST](http://localhost:51955/graphql)

Query
```graphql
query ($token: String!) {
  contacts(token: $token) {
    name
    phones
    last_update
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
    name
    phones
    last_update
  }
}
------------
variable
{
  "token": "oid1",
  "contacts": [{
    "name": "a",
    "phones": ["1"],
    "last_update": 1494474854
  },{
    "name": "b",
    "phones": ["2", "222"],
    "last_update": 1494474854
  }]
}
```

# todo
1. docker (compose)