const _ = require('underscore');


function isSameContact({ nameA, phonesA }, { nameB, phonesB }) {
    return nameA == nameB && _.isEqual(phonesA, phonesB) ;
}

module.exports = {
    isSameContact,
}