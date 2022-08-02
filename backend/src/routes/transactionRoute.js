const express = require('express')
const Transaction = require('../modules/transaction')
const auth = require('../middlewares/auth')
const res = require('express/lib/response')
const router = new express.Router()

// POST - /trans - Add new transaction
router.post('/trans', auth, async (req,res)=>{
    const transaction = new Transaction({
        ...req.body,
        owner: req.user._id
    })

    try {
        await transaction.save()
        res.status(201).send(transaction)
    }
    catch (e) {
        res.status(400).send(e)
    }
})

// GET - /trans - List all transaction of current user
router.get('/trans', auth, async (req, res) => {
    try {
        await req.user.populate('transactions')
        res.send(req.user.transactions)
        
    } catch (e) {
        res.status(500).send()
    }
})

//GET - /trans/:id - Get transaction by ID
router.get('/trans/:id' , auth, async(req,res) => {
    try{
        const _id = req.params.id 
        const trans = await Transaction.findOne({_id, owner:req.user._id}) 
        if(!trans){
            res.status(404).send()
        }
        res.send(trans)
    }
    catch(e){
        res.status(500).send()
    }
})

//PATCH - /trans/:id - Update transaction by ID
router.patch('/trans/:id', auth, async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['text', 'amount']
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))
    if(!isValidOperation){
        return res.status(400).send({ error: 'Invalid updates!' })
    }
    try{
        const trans = await Transaction.findOne({_id: req.params.id, owner:req.user._id})
        if(!trans){
            return res.status(404).send()
        }
        updates.forEach((update)=> trans[update] = req.body[update])
        await trans.save()
        res.send(trans)
    }
    catch(e){
        res.status(400).send(e)
    }
})

//DELETE - /trans/:id - Delete by ID
router.delete('/trans/:id', auth, async (req,res)=>{
    try{
        const trans = await Transaction.findOneAndDelete({_id: req.params.id, owner:req.user._id})
        if(!trans){
            res.status(404).send()
        }
        res.send(trans)
    }
    catch(e){
        res.status(500).send()
    }

})

module.exports = router