const express = require('express');
const mongoose = require('mongoose');
const mongo = require("mongodb").MongoClient
const morgan = require('morgan');
const path = require('path');
const Schema = mongoose.Schema;
const cors = require('cors')

const app = express();
var db, users
const userScheme = new Schema({
    name: String,
    phone: String,
    password: String
});
const User = mongoose.model("User", userScheme);

app.listen(3000, () => {
    console.log(`\n[OK] Server is running on localhost:3000\n------------------`);
});
mongo.connect('mongodb://localhost:27017/cook-service', 
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err, client) => {
        if (err) {
            console.error(err)
            return
        }
        db = client.db('cook-service')
        users = db.collection('users')
    }
)
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(morgan('dev'));
app.use(cors())

app.post('/registration', (req, res) => {
    let value = req.body
    console.log(value)
    console.log("добавляем чела")
    users.insertOne(value, (err, result) => {
        if (err) {
            console.error(err)
            console.log("не добавлен(((\n-------------------")
            res.status(500).json({ err: err })
            return
        }
        console.log(result)
        console.log("добавлен)\n-------------------")
        res.status(200).json({ ok: true })
    })
})