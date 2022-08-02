const express = require('express')
const userRoute = require('./routes/userRoute')
const transactionRoute = require('./routes/transactionRoute')
const {connect} = require('./config/mongoose')
require("dotenv").config();

const app = express()
const port = process.env.PORT
connect()

app.use(express.json())
app.use(userRoute)
app.use(transactionRoute)


app.listen(port, () => {
    console.log('Server is up on port ' + port)
})

// const Transaction = require('./modules/transaction');
// const main = async () => {
//     const trans = await Transaction.findById('62e9322d2ad6246905549952')
//     await trans.populate('owner')//.execPopulate()
//     console.log(trans.owner)
// }
// main() 