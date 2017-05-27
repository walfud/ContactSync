const _ = require('underscore');

const a = {
    a: 1,
    b: [
        "1111",
        {
            x: "zzz"
        }
    ]
}
const b = {
    a: 1,
    b: [
        "1111",
        {
            x: "zz"
        }
    ]
}

console.log(_.isEqual(a, b));