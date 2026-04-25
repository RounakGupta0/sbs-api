const express = require('express')
const Router = express.Router()
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cloudinary = require('cloudinary')

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret : process.env.API_SECRET
})

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
        const uploadedresult = await cloudinary.uploader.upload(req.files.photo.tempFilePath)

        const newUser = new User({
            fullName: req.body.fullName,
            phone: req.body.phone,
            email: req.body.email,
            password: hash,
            imageId : uploadedresult.public_id,
            imageUrl: uploadedresult.secure_url
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

Router.post('/login', async (req, res) => {
    try {
        const user = await User.find({ email: req.body.email })
        //console.log(IsEmail)
        if (user.length == 0) {
            return res.status(500).json({
                error: "User not registered"
            })
        }
        const isMatch = await bcrypt.compare(req.body.password, user[0].password)
        if (!isMatch) {
            return res.status(500).json({
                error: "Invalid password"
            })
        }
        const appToken = await jwt.sign({
            userId: user[0]._id,
            fullName: user[0].fullName,
            email: user[0].email
        },
        (process.env.SEC_KEY)
        ,
            {
                expiresIn: '24h'
            }
        )
        res.status(200).json({
            token:appToken
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
})



module.exports = Router