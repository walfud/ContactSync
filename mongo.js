
db = connect("localhost:27017/contactsync");

db.user.insertOne({
    oid: "oid1",
    contacts: [
        {
            "name": "c",
            "phones": ["3"],
            "last_update": 1494474854000
        },
    ]
});