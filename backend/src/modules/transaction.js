const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
    text: {
        type: String,
        trim: true,
        require:[true, 'Please add some text']
    },
    amount: {
        type: Number,
        require:[true, 'Please add a positive or negative number']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    }
}, {
    timestamps : true
});


const Transaction = mongoose.model('Transaction',transactionSchema );

module.exports = Transaction