# ContactSync

[TEST](http://contactsync.walfud.com/graphql)

Mutation
```graphql
 mutation ($token: String!, $contacts: [ContactInputType]!) {
  upload(token: $token, contacts: $contacts)
}
------------
{
  "token": "48d61801-8f27-496f-b25d-955f9b4d4af9",
  "contacts": [
    {
      "name": "serverA",
      "phones": [
        "1"
      ],
      "modify_time": 1494474854000,
      "is_deleted": false
    },
    {
      "name": "serverB",
      "phones": [
        "2222",
        "2222.2222",
      ],
      "modify_time": 1494474854000,
      "is_deleted": false
    },
    {
      "name": "serverC",
      "phones": [
        "3333"
      ],
      "modify_time": 1494474854000,
      "is_deleted": false
    },
  ]
}
```

# todo
1. docker (compose)