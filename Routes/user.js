const express = require('express')
const Router = express.Router()

// signup api
Router.post('/signup',(req,res)=>{
    res.status(200).json({
        msg: 'signup response'
    })
})

// login api
Router.post('/login',(req,res)=>{
    res.status(200).json({
        msg: 'login response'
    })
})

module.exports = Router