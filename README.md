# ContactSync

[TEST](http://localhost:51955/graphql)

Mutation
```graphql
 mutation ($token: String!, $contacts: [ContactInputType]!) {
  sync(token: $token, contacts: $contacts) {
    contacts {
      id
      name
      phones
      modify_time
      is_deleted
    }
  }
}
------------
{
  "token": "oid1",
  "contacts": [
    {
      "name": "a",
      "phones": [
        "1"
      ],
      "modify_time": 1494474854000,
      "is_deleted": false
    },
    {
      "name": "a2",
      "phones": [
        "122222"
      ],
      "modify_time": 1494474854000,
      "is_deleted": false
    },
    {
      "id": "b",
      "name": "b",
      "phones": [
        "2"
      ],
      "modify_time": 1494474854000,
      "is_deleted": false
    },
    {
      "id": "c",
      "name": "c",
      "phones": [
        "3"
      ],
      "modify_time": 1494474854000,
      "is_deleted": true
    }
  ]
}
```

# todo
1. docker (compose)