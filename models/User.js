const {Schema, model} = require('mongoose')

const User = new Schema({
    name: {
        type: String,
        required: true
    },
    fullphone: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    deposit: {
        type: Number,
        required: false,
        default: 0
    },
    orders: {
        type: Array,
        required: false,
        default: []
    },
    cart: {
        type: Array,
        required: false,
        default: []
    },
    cards: {
        type: Array,
        required: false,
        default: []
    },
    adresses: {
        type: Array,
        required: false,
        default: []
    },
    likes: {
        type: Array,
        required: false,
        default: []
    },
    roles: [{
        type: String, 
        ref: 'Role'
    }]
})

module.exports = model('User', User)