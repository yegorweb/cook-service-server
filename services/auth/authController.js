const Role = require('../../models/Role')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {secret} = require("../../config")
const server = require('../../server')

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
            const {name, fullphone, phone, password} = req.body;
            let candidate = await users.findOne({phone: phone})
            if (candidate) {
                return res.status(400).json({message: "Пользователь с таким же номером телефона уже существует", type: 'error'})
            }
            const hashPassword = bcrypt.hashSync(password, 7);
            console.log(req.body)
            const user = new User({name: name, fullphone: fullphone, phone: phone, password: hashPassword, roles: ["USER"]})
            server.users.insertOne(user, (err, result) => {
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
                res.send({ok: true, message: 'Вы успешно зарегистрированы', accessToken: '', type: 'success', user: user})
            })
        } catch (e) {
            res.status(400).json({message: 'Ошибка сервера: ' + e, type: 'error'})
        }
    }
    async login(req, res) {

    }
}

module.exports = new authController()