
db = connect("localhost:27017/contactsync");
db.user.drop();
db.user.insertOne({
    oid: "oid1",
    contacts: [
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

        //
        {
            "id": "x",
            "name": "x",
            "phones": [
                "7777777"
            ],
            "modify_time": 1494474854000,
            is_deleted: false,
        },
        {
            "id": "x2",
            "name": "x2",
            "phones": [
                "7222222"
            ],
            "modify_time": 1494474854000,
            is_deleted: false,
        },
        {
            "id": "y",
            "name": "y",
            "phones": [
                "88888888"
            ],
            "modify_time": 1494474854000,
            is_deleted: false,
        },
        {
            "id": "z",
            "name": "z",
            "phones": [
                "999999999"
            ],
            "modify_time": 1494474854000,
            is_deleted: true,
        },
    ]
});