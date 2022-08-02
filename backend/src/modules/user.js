const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Transaction = require('./transaction')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        require:true
    },
    age:{
        type: Number,
        require:true,
        validate(value) {
            if ( value < 0 ) {
                throw new Error('Age must be positive')
            }
        }
    },
    email: {
        type: String,
        require: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        require:true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    balanceAmount: {
        type: Number,
        default: 0
    }
    ,
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
}, {
    timestamps: true
})
//Set up relation ship between transaction and user
userSchema.virtual('transactions', {
    ref: 'Transaction',
    localField: '_id',
    foreignField: 'owner'
})

// Hiding data
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    // delete userObject.password
    // delete userObject.tokens
    // delete userObject.avatar

    const {password, tokens, avatar, ...rest} = userObject

    return rest
}

//Check mail and match password
userSchema.statics.findByCredentials = async function(email,password){
    const user = await User.findOne({email})
    if(!user){
        return res.status(401).json('User not found!')
    }
    const isMatch = bcrypt.compare(password,user.password)
    if(!isMatch){
        return res.status(401).json('Error password! Cannot login!')
    }
    return user
}

// Create Token
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

// Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
    const user = this
    await Transaction.deleteMany({ owner: user._id })
    next()
})


const User = mongoose.model('User', userSchema);

module.exports = User