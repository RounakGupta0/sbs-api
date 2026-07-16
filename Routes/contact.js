const express = require('express')
const Router = express.Router()
const Contact = require('../models/Contact')
const jwt = require('jsonwebtoken')
const { default: mongoose } = require('mongoose')
const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})

//--------add contact--------


Router.post('/add-contact', async (req, res) => {
    try {
        // console.log('image',req.files.photo)
        //console.log(req.headers.authorization.split(" ")[1])
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token, process.env.SEC_KEY)

        const uploadedresult = await cloudinary.uploader.upload(req.files.photo.tempFilePath)
        //console.log(uploadedresult)

        const newContact = new Contact({
            fullName: req.body.fullName,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            gender: req.body.gender,
            userId: tokenData.userId,
            imageId: uploadedresult.public_id,
            imageUrl: uploadedresult.secure_url
        })
        // const newContact = Contact(req.body)
        const newData = await newContact.save()
        res.status(200).json({
            result: newData
        })

    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
})


// ----------get contacts-----------

Router.get('/get-contact', async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token, process.env.SEC_KEY)

        const allContact = await Contact.find({ userId: tokenData.userId }).select("_id fullName email phone userId imageId imageUrl").populate('userId', 'fullName email')
        //console.log(allContact)
        res.status(200).json({
            contacts: allContact
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
})

// get contact by id

Router.get('/contactById/:id', async (req, res) => {
    try {
        //console.log(req.params.id)
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token, process.env.SEC_KEY)
        const data = await Contact.find({ _id: req.params.id, userId: tokenData.userId }).select("_id fullName email phone address gender userId imageId imageUrl").populate('userId', 'fullName email')
        if (data.length === 0) {
            return res.status(404).json({
                message: 'no contact found'
            })
        }

        return res.status(200).json({     //why we used return here
            contact: data[0]
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
})

//get contact by gender

Router.get('/gender/:g', async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token, process.env.SEC_KEY)
        const contact = await Contact.find({ gender: req.params.g, userId: tokenData.userId })
        res.status(200).json({
            contact: contact
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
})

// delete api

Router.delete('/:id', async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)

        const contact = await Contact.findById(req.params.id)
        if (contact.userId != tokenData.userId) {
            return res.status(500).json({
                msg: 'invalid user'
            })
        }

        await cloudinary.uploader.destroy(contact.imageId)
        const result = await Contact.deleteOne({ _id: req.params.id, userId: tokenData.userId })

        res.status(200).json({
            msg: 'data deleted'
        })

    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
})

// delete many data

Router.delete('/byGender/:gender', async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token, process.env.SEC_KEY)
        //userID = tokenData.userId
        const contacts = await Contact.find({ userId: tokenData.userId, gender: req.params.gender })
        contacts.forEach(async (contact) => {
            await cloudinary.uploader.destroy(contact.imageId)
        })
        const result = await Contact.deleteMany({ gender: req.params.gender, userId: tokenData.userId })
        res.status(200).json({
            msg: `${result.deletedCount} contacts of the ${req.params.gender} gender is deleted`
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
})

// update api

Router.put('/update/:id', async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token, process.env.SEC_KEY)

        const IDContact = await Contact.findById(req.params.id)
        if (!IDContact) {
            return res.status(404).json({
                msg: 'no contacts exists with this id'
            })
        }
        if (IDContact.userId != tokenData.userId) {
            return res.status(400).json({
                msg: "you dont have accesss to this data"
            })
        }
        const newContact = {
            fullName: req.body.fullName,
            phone: req.body.phone,
            email: req.body.email,
            address: req.body.address,
            gender: req.body.gender,
            userId: tokenData.userId
        }
        if (req.files) {
            await cloudinary.uploader.destroy(IDContact.imageId)
            const uploadedresult = await cloudinary.uploader.upload(req.files.photo.tempFilePath)
            newContact['imageId'] = uploadedresult.public_id
            newContact['imageUrl'] = uploadedresult.secure_url
        }
        else {
            newContact['imageId'] = IDContact.imageId
            newContact['imageUrl'] = IDContact.imageUrl
        }
        const updatedContact = await Contact.findByIdAndUpdate(req.params.id, newContact, { new: true })

        res.status(200).json({
            msg: 'data updated',
            data: updatedContact
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
})

//-------count api --------
Router.get('/count', async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token, process.env.SEC_KEY)

        const data = await Contact.countDocuments({ userId: tokenData.userId })
        res.status(200).json({
            msg: `you have added ${data} contact(s) in total`
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
})

//-----count by gender-------
Router.get('/count/:gender', async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token, process.env.SEC_KEY)
        const data = await Contact.countDocuments({ userId: tokenData.userId, gender: req.params.gender })
        res.status(500).json({
            msg: `you have added ${data} contact(s) of the ${req.params.gender} gender`
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
})

Router.get('/dashboard/home', async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token, process.env.SEC_KEY)

        const dataCount = await Contact.countDocuments({ userId: tokenData.userId })
        const maleCount = await Contact.countDocuments({ userId: tokenData.userId, gender: 'Male' })
        const femaleCount = await Contact.countDocuments({ userId: tokenData.userId, gender: 'Female' })

        const recent = await Contact.find({ userId: tokenData.userId })
            .sort({ _id: -1 })
            .limit(5);
        // console.log(dataCount,maleCount,femaleCount,recent)

        res.status(200).json({
            data: {
                totalContact: dataCount,
                maleCount: maleCount,
                femaleCount: femaleCount,
                recent: recent
            }
        })

    }
    catch (err) {
        console.log(err)
    }
})

module.exports = Router