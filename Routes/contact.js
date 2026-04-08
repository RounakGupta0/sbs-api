const express = require('express')
const Router = express.Router()
const Contact = require('../models/Contact')

//--------add contact--------

// Router.post('/add-contact',(req,res)=>{
// //    console.log(req.body)
// const newContact = new Contact({
//     fullName:req.body.name,
//     email:req.body.person_email,
//     phone:req.body.person_phone,
//     address:req.body.add
// })

// newContact.save()
// .then((result)=>{
//     console.log('data saved')
//     res.status(200).json({
//         msg:'data saved'
//     })
// })
// .catch((err)=>{
//     console.log(err)
//     res.status(500).json({
//         error:'something is wrong'
//     })
// })

// })

Router.post('/add-contact', async (req, res) => {
    try {
        // const newContact = new Contact({
        //     fullName: req.body.name,
        //     email: req.body.person_email,
        //     phone: req.body.person_phone,
        //     address: req.body.add
        // })
        const newContact = Contact(req.body)
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

Router.get('/get-contact',async(req,res)=>{
    try{
        const allContact = await Contact.find().select("_id fullName email phone adress gender")
        res.status(200).json({
            contacts:allContact
        })
    }
    catch(err){
        console.log(err)
        res.status(500).json({
            error : err
        })
    }
})

// get contact by id

Router.get('/contactById/:id',async(req,res)=>{
    try
    {
        //console.log(req.params.id)
        const id = req.params.id
        const data = await Contact.findById(id).select("_id fullName email phone address gender")
        res.status(200).json({
            contact : data
        })
    }
    catch(err)
    {
        console.log(err) 
        res.status(500).json({
            error:err
        })
    }
})

//get contact by gender

Router.get('/gender/:g',async(req,res)=>{
    try
    {
        const contact = await Contact.find({gender:req.params.g})
        res.status(200).json({
            contact:contact
        })
    }
    catch(err)

    {
        console.log(err)
        res.status(500).json({
            error : err
        })
    }
})

// delete api
Router.delete('/:id',async(req,res)=>{
    try
    {
        await Contact.deleteOne({_id:req.params.id})
        res.status(200).json({
            msg:'data deleted'
        })
    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
})

// delete many data

Router.delete('/byGender/:gender',async(req,res)=>{
    try
    {
        await Contact.deleteMany({gender:req.params.gender})
        res.status(200).json({
            msg:`All contacts of the ${req.params.gender} gender is deleted`
        })
    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
})

module.exports = Router