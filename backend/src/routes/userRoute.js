const User = require('../modules/user')
const express = require('express')
//const { findOne } = require('../modules/user')
const router = express.Router()
const auth = require('../middlewares/auth')

// POST - /users/register - Create new user
router.post('/users/register', async (req,res) => {
    const { email } = req.body
    const user = await User.findOne({email});
    if(!user){
        const newUser = new User(req.body)
        
        try{
            await newUser.save()  
            const token = await newUser.generateAuthToken()
            res.status(201).send({newUser,token})
        }
        catch(e){
            res.status(400).send(e)
        }
    } else {
        res.status(404).json(('User has already exist'))
    }

})

// POST - /users/login - LOGIN 
router.post('/users/login', async (req,res) => {

    try{
        const {email,password} = req.body
        const user = await User.findByCredentials(email,password)
        const token = await user.generateAuthToken()
        res.status(200).send({user,token})
    } catch(e){
        res.status(400).send(e)
    }

})

// POST - /users/logout - LOGOUT
router.post('/users/logout', auth, async (req, res) => {
    try {

        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        
        await req.user.save()

        res.send()
    } catch (e) {
       
        res.status(500).send()
    }
})

// POST - /users/logoutAll - LOGOUT ALL
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// GET - /users/me - GET PROFILE
router.get('/users/me', auth, async (req,res)=> {
    res.send(req.user)
})

// PATCH - /users/me - UPDATE PROFILE
router.patch('/users/me', auth, async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid updates!'})
    }
    try {
        updates.forEach((update)=> req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    }
    catch(e){
        res.status(400).send(e)
    }
})

// DELETE - /users/me - DELETE ACCOUNT
router.delete('/users/me',auth, async(req,res)=>{
    try{
        await req.user.remove()
        res.send(req.user)
    }
    catch (e){
        res.status(500).send(e)
    }
})
module.exports = router