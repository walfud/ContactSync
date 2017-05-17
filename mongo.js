
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
                "7"
            ],
            "modify_time": 1494474854000,
            is_deleted: false,
        },
        {
            "id": "y",
            "name": "y",
            "phones": [
                "8"
            ],
            "modify_time": 1494474854000,
            is_deleted: false,
        },
        {
            "id": "z",
            "name": "z",
            "phones": [
                "9"
            ],
            "modify_time": 1494474854000,
            is_deleted: true,
        },

        {
            "id": "a",
            "name": "a",
            phones: [
                "1"
            ],
            modify_time: 1494474854000,
            is_deleted: false,
        },
        {
            "id": "b",
            "name": "b",
            phones: [
                "2"
            ],
            modify_time: 1494474854000,
            is_deleted: false,
        },
        {
            "id": "c",
            "name": "c",
            "phones": [
                "3"
            ],
            "modify_time": 1494474854000,
            is_deleted: false,
        },
    ]
});