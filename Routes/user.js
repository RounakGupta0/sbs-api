const express = require('express')
const Router = express.Router()
const User = require('../models/User')
const bcrypt = require('bcrypt')

// signup api
Router.post('/signup', async (req, res) => {
    try {
        const data = await User.find({ email: req.body.email })
        if (data.length > 0) {
            return res.status(200).json({
                message: "Email already registered"
            })
        }
        const hash = await bcrypt.hash(req.body.password, 10)
        const newUser = new User({
            fullName: req.body.fullName,
            phone: req.body.phone,
            email: req.body.email,
            password: hash
        })

        await newUser.save()
        const result = {
            fullName: newUser.fullName,
            phone: newUser.phone,
            email: newUser.email
        }
        res.status(200).json({
            message: "new user added", data: result
        })

    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
})

// login api
Router.post('/login',(req,res)=>{
    res.status(200).json({
        msg: 'login response'
    })
})

module.exports = Router