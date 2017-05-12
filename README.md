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
mutation ($token: String!, $contacts: SyncDataInputType!) {
  sync(token: $token, contacts: $contacts) {
    to_fills
    to_adds {
      id
      name
      phones
      is_deleted
    }
    to_mods {
      id
      name
      phones
      is_deleted
    }
    to_dels {
      id
      name
      phones
      is_deleted
    }
  }
}
------------
{
  "token": "oid1",
  "contacts": {
    "want_adds": [
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
      }
    ],
    "want_mods": [
      {
        "id": "b",
        "name": "b",
        "phones": [
          "2",
          "22"
        ],
        "modify_time": 1494474854000,
        "is_deleted": false
      }
    ],
    "want_dels": [
      {
        "id": "c",
        "is_deleted": false
      }
    ],
    "unchanges": [
      {
        "id": "x",
        "name": "x",
        "phones": [
          "7777777"
        ],
        "modify_time": 1494474854000,
        "is_deleted": false
      },
      {
        "id": "y",
        "name": "y",
        "phones": [
          "&&&&&"
        ],
        "modify_time": 1494474854000,
        "is_deleted": false
      },
      {
        "id": "z",
        "name": "z",
        "phones": [
          "999999999"
        ],
        "modify_time": 1494474854000,
        "is_deleted": false
      }
    ]
  }
}
```

# todo
1. docker (compose)