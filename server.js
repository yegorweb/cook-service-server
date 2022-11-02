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
        var id = new ObjectId((value.user_id).trim())
        let user = await users.findOne({'_id': id})
        if (!user) {
            res.status(404).send()
        }
        let cart = user.cart
        console.log(cart)
        for (let i = 0; i < cart.length; i++) {
            if (_.isEqual(cart[i], value.item)) {
                res.status(304).send()
                return
            }
        }
        users.updateOne({'_id': id}, {$push: {'cart': value.item}})
        console.log(value.item)
        res.status(200).send()
    } catch(e) {
        res.send({message: 'Error: ' + e})
        console.error('Error: ' + e)
    }
})
app.get('/items', async function(req, res) {
    try {
        let result = await db.collection('items').find({visible: true}).toArray()
        result ? res.status(200).send(result) : res.status(404).send()
        return
    } catch(e) {
        res.send({message: 'Error: ' + e})
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
            console.log(order)
            user_orders.push(order)
        }
        console.log('ORDERS: '+user_orders)
        res.send(user_orders)
        return
    } catch(e) {
        res.send({message: 'Error: ' + e})
        console.error('Error: ' + e)
    }
})
app.get('/order', async function(req, res) {
    try {
        let id = new ObjectId((req.query.id).trim())
        console.log(id)
        let order = await orders.findOne({'_id': id})
        console.log(order)
        res.send(order)
    } catch(e) {
        res.send({message: 'Error: ' + e})
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
            res.send()
            return
        }
        for (let i = 0; i < cart.length; i++) {
            let item_id = new ObjectId((cart[i]._id).trim())
            let item = await items.findOne({'_id': item_id})
            if (item) {
                cart[i] = Object.assign({}, item, cart[i])
                console.log(Object.assign({}, item, cart[i]))
            } else {
                res.status(404).send()
                return
            }
        }
        res.send(cart)
        console.log(cart)
        return
    } catch(e) {
        res.send({message: 'Error: ' + e})
        console.error('Error: ' + e)
    }
})
app.get('/item', async function(req, res) {
    try {
        let id = new ObjectId((req.query.id).trim())
        console.log(id)
        let item = await items.findOne({'_id': id})
        console.log(item)
        res.send(item)
    } catch(e) {
        res.send({message: 'Error: ' + e})
        console.error('Error: ' + e)
    }
})
app.get('/info', async function(req, res) {
    try {
        let info = await db.collection('information').find().toArray()
        info = Object.assign(...info)
        res.send(info)
    } catch(e) {
        res.send({message: 'Error: ' + e})
        console.error('Error: ' + e)
    }
})