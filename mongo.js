
db = connect("localhost:27017/contactsync");
db.user.drop();
db.user.insertOne({
    oid: "oid1",
    contacts: [
                //
        {
            "id": "x",
            "name": "x",
            "phones": [
                "test client add"
            ],
            "modify_time": 1494474854000,
            is_deleted: false,
        },
        {
            "id": "y",
            "name": "y",
            "phones": [
                "test client modify"
            ],
            "modify_time": 1494474854000,
            is_deleted: false,
        },
        {
            "id": "z",
            "name": "z",
            "phones": [
                "test client delete"
            ],
            "modify_time": 1494474854000,
            is_deleted: true,
        },

        {
            "id": "a",
            "name": "a",
            phones: [
                "test server pass"
            ],
            modify_time: 1494474854000,
            is_deleted: false,
        },
        {
            "id": "b",
            "name": "b",
            phones: [
                "test server modify"
            ],
            modify_time: 1494474854000,
            is_deleted: false,
        },
        {
            "id": "c",
            "name": "c",
            "phones": [
                "test server delete"
            ],
            "modify_time": 1494474854000,
            is_deleted: false,
        },
    ]
});