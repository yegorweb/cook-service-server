const express = require('express')
const router = express.Router()
const cors = require('cors')
const controller = require('./authController')
const authMiddleware = require('./middlewaree/authMiddleware')
const roleMiddleware = require('./middlewaree/roleMiddleware')
const { collection } = require('./models/User')

router.use(cors())
router.post('/registration', controller.registration)

module.exports = router