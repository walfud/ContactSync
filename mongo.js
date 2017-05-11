
db = connect("localhost:27017/contactsync");
db.user.drop();
db.user.insertOne({
    oid: "oid1",
    contacts: [
        {
            "id": "a",
            "name": "a",
            phones: ["1"],
            modify_time: 1494474854000,
        },
        {
            "id": "b",
            "name": "b",
            phones: ["2"],
            modify_time: 1494474854000,
        },
        {
            "id": "c",
            "name": "c",
            "phones": ["3"],
            "modify_time": 1494474854000
        },
    ]
});