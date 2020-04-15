const Store = require('electron-store');

const schema = {
    upper: {
        type: 'boolean',
        default: true
    },
    lower: {
        type: 'boolean',
        default: true
    },
    numbers: {
        type: 'boolean',
        default: true
    },
    symbols: {
        type: 'boolean',
        default: true
    },
    minNum: {
        type: 'number',
        minimum: 1,
        default: 1
    },
    minSym: {
        type: 'number',
        minimum: 1,
        default: 1
    },
    length: {
        type: 'number',
        minimum: 5,
        maximum: 128,
        default: 25
    },
    ambigousRm: {
        type: 'boolean',
        default: true
    }
}

const store = new Store({schema});

module.exports = store;