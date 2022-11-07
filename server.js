const express = require('express');
const mongoose = require('mongoose');
const mongo = require("mongodb").MongoClient;
const ObjectId = require('mongodb').ObjectId
const bcrypt = require('bcryptjs');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const User = require('./models/User')
const _ = require('lodash');
const etag = require('etag')

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(morgan('dev'));
app.use(cors());

var db, users, orders, items, information

const start = async () => {
    app.listen(3000, () => {
        console.log(`\n[OK] Server is running on localhost:3000\n------------------`);
    })
    mongo.connect('mongodb://localhost:27017/cook-service', 
        { useNewUrlParser: true, useUnifiedTopology: true },
        (err, client) => {
            if (err) {
                console.error(err);
                return
            }
            db = client.db('cook-service');
            users = db.collection('users');
            orders = db.collection('orders');
            items = db.collection('items');
            information = db.collection('information');
        }
    )
}
start();

app.post('/registration', async function(req, res) {
    try {
        console.log('Пытались зарегаться')
        console.log()
        const {name, fullphone, phone, password} = req.body;
        let candidate = await users.findOne({phone: phone})
        if (candidate) {
            return res.status(400).json({message: "Пользователь с таким же номером телефона уже существует"})
        }
        const hashPassword = bcrypt.hashSync(password, 7);
        console.log(req.body)
        const user = new User({name: name, fullphone: fullphone, phone: phone, password: hashPassword, roles: ["USER"]})
        users.insertOne(user, (err, result) => {
            if (err) {
                console.error(err)
                console.log("не добавлен(((\n-------------------")
                res.status(500).json({message: 'Ошибка сервера: ' + err })
                res.send()
                return
            }
            console.log(result)
            console.log("добавлен)\n-------------------")
            res.status(200)
            res.send()
        })
    } catch (e) {
        res.status(400).json({message: 'Ошибка сервера: ' + e})
    }
})
app.post('/add-to-cart', async function(req, res) {
    try {
        let value = req.body
        let id = new ObjectId((value.user_id).trim())
        let user = await users.findOne({'_id': id})
        if (!user) {
            res.status(404).send({message: 'Авторизуйтесь, чтобы добавить блюдо в корзину', type: 'error'})
            return
        }
        let cart = user.cart
        console.log(cart)
        for (let i = 0; i < cart.length; i++) {
            let comparable_cart_item = Object.assign({}, cart[i])
            delete comparable_cart_item.amount

            let comparable_req_item = Object.assign({}, value.item)
            delete comparable_req_item.amount

            if (_.isEqual(comparable_cart_item, comparable_req_item)) {
                res.status(304).send({message: 'Упс! Такое в вашей корзине уже лежит', type: 'info'})
                return
            }
        }
        users.updateOne({'_id': id}, {$push: {'cart': value.item}})
        console.log(value.item)
        res.status(200).send({message: 'Блюдо добавлено в корзину', type: 'success'})
    } catch(e) {
        res.send({message: 'Error: ' + e, type: 'error'})
        console.error('Error: ' + e)
    }
})
app.post('/add-address', async function(req, res) {
    try {
        let value = req.body
        let id = new ObjectId((value.user_id).trim())
        let user = await users.findOne({'_id': id})
        if (!user) {
            res.status(404).send({message: 'Авторизуйтесь, чтобы добавить адрес', type: 'error'})
            return
        }
        let addresses = user.addresses
        if (addresses.find(address => address.name === value.address.name && address.address === value.address.address)) {
            res.status(400).send({message: 'Адрес с таким именем или адресом вы уже добавили', type: 'error'})
            return
        }
        users.updateOne({'_id': id}, {$push: {'addresses': value.address}})
        res.status(200).send({message: 'Адрес успешно добавлен', type: 'success'})
        return
    } catch(e) {
        res.send({message: 'Error: ' + e, type: 'error'})
        console.error('Error: ' + e)
    }
})
app.get('/get-addresses', async function(req, res) {
    try {
        let id = new ObjectId((req.query.id).trim())
        let user = await users.findOne({'_id': id})
        if (!user) {
            res.status(404).send({message: 'Авторизуйтесь, чтобы посмотреть ваши адреса', type: 'error'})
            return
        }
        res.status(200).send(user.addresses)
        return
    } catch(e) {
        res.send({message: 'Error: ' + e, type: 'error'})
        console.error('Error: ' + e)
    }
})
app.get('/items', async function(req, res) {
    try {
        let result = await db.collection('items').find({visible: true}).toArray()
        result ? res.status(200).send(result) : res.status(404).send()
        return
    } catch(e) {
        res.send({message: 'Error: ' + e, type: 'error'})
        console.error('Error: ' + e)
    }
})
app.get('/user-orders', async function(req, res) {
    try {
        let id = new ObjectId((req.query.id).trim())
        var user = await users.findOne({'_id': id})
        var user_orders = []
        if (!user) {
            res.status(404).send()
            return
        }
        for (let i = 0; i < user.orders.length; i++) {
            let order_id = new ObjectId((user.orders[i]).trim())
            let order = await orders.findOne({'_id': order_id})
            if (!order) {
                res.status(404).send()
                return
            }
            console.log(order)
            user_orders.push(order)
        }
        console.log('ORDERS: '+user_orders)
        res.send(user_orders)
        return
    } catch(e) {
        res.send({message: 'Error: ' + e, type: 'error'})
        console.error('Error: ' + e)
    }
})
app.get('/order', async function(req, res) {
    try {
        let id = new ObjectId((req.query.id).trim())
        console.log(id)
        let order = await orders.findOne({'_id': id})
        if (!order) {
            res.status(404).send()
            return
        }
        console.log(order)
        res.send(order)
    } catch(e) {
        res.send({message: 'Error: ' + e, type: 'error'})
        console.error('Error: ' + e)
    }
})
app.get('/get-cart', async function(req, res) {
    try {
        let id = new ObjectId((req.query.id).trim())
        var user = await users.findOne({'_id': id})
        if (!user) {
            res.status(404).send()
            return
        }
        var cart = user.cart
        if (cart.length == 0) {
            res.status(202).send()
            return
        }
        for (let i = 0; i < cart.length; i++) {
            let item_id = new ObjectId((cart[i]._id).trim())
            let item = await items.findOne({'_id': item_id})
            if (!item) {
                res.status(404).send()
                return
            }
            cart[i] = Object.assign({}, item, cart[i])
            console.log(Object.assign({}, item, cart[i]))
        }
        res.status(200).send(cart)
        console.log(cart)
        return
    } catch(e) {
        res.send({message: 'Error: ' + e, type: 'error'})
        console.error('Error: ' + e)
    }
})
app.get('/item', async function(req, res) {
    try {
        let id = new ObjectId((req.query.id).trim())
        console.log(id)
        let item = await items.findOne({'_id': id})
        if (!item) {
            res.status(404).send()
            return
        }
        console.log(item)
        res.send(item)
    } catch(e) {
        res.send({message: 'Error: ' + e, type: 'error'})
        console.error('Error: ' + e)
    }
})
app.get('/info', async function(req, res) {
    try {
        let info = await db.collection('information').find().toArray()
        info = Object.assign(...info)
        res.send(info)
    } catch(e) {
        res.send({message: 'Error: ' + e, type: 'error'})
        console.error('Error: ' + e)
    }
})