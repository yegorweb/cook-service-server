const express = require('express');
const mongoose = require('mongoose');
const mongo = require("mongodb").MongoClient;
const ObjectId = require('mongodb').ObjectId
const bcrypt = require('bcryptjs');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const User = require('./models/User')

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(morgan('dev'));
app.use(cors());

var db, users, orders, items

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
        }
    )
}
start();

app.post('/registration', async function(req, res) {
    try {
        console.log('Пытались зарегаться')
        console.log()
        const {name, fullphone, phone, password} = req.body;
        const candidate = await users.findOne({phone: phone})
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
