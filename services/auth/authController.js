const User = require('./models/User')
const Role = require('./models/Role')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {secret} = require("./config")
const server = require('./server')

const generateAccessToken = (id, roles) => {
    const payload = {
        id,
        roles
    }
    return jwt.sign(payload, secret, {expiresIn: "24h"} )
}

class authController {
    async registration(req, res) {
        try {
            console.log('Пытались зарегаться')
            console.log()
            const {name, fullphone, phone, password} = req;
            const candidate = await User.findOne({phone})
            if (candidate) {
                return res.status(400).json({message: "Пользователь с таким же номером телефона уже существует"})
            }
            const hashPassword = bcrypt.hashSync(password, 7);
            console.log(req.body)
            const user = new User({name: name, fullphone: fullphone, phone: phone, password: hashPassword, roles: ["USER"]})
            server.users.insertOne(value, (err, result) => {
                if (err) {
                    console.error(err)
                    console.log("не добавлен(((\n-------------------")
                    res.status(500).json({message: err })
                    res.send()
                    return
                }
                console.log(result)
                console.log("добавлен)\n-------------------")
                res.status(200).json({message: "Пользователь успешно зарегистрирован"})
                res.send()
                return
            })
            // let value = req.body
            // console.log(value)
            // console.log("добавляем чела")
            // if (!users.findOne({phone: value.phone})) {
            //     users.insertOne(value, (err, result) => {
            //         if (err) {
            //             console.error(err)
            //             console.log("не добавлен(((\n-------------------")
            //             res.status(500).json({ err: err })
            //             res.send()
            //             return
            //         }
            //         console.log(result)
            //         console.log("добавлен)\n-------------------")
            //         res.status(200).json({ ok: true })
            //         res.send()
            //         return
            //     })
            // } else {
            //     res.status(401).json({ err: 'Пользователь с таким же номером телефона уже существует' })
            //     console.log('Пытался войти чел с существующим номером телефонв')
            //     res.send()
            //     return
            // }
        } catch (e) {
            res.status(400).json({message: 'Registration error' + e})
        }
    }
}

module.exports = new authController()