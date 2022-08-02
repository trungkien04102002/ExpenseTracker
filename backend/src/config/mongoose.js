const mongoose = require('mongoose')

async function connect(){
    try{
        await mongoose.connect(process.env.MONGODB_URL, {
         useNewUrlParser: true
        });
        
        console.log('Connect database successfully')
    }
    catch(e){
        console.log('Fail to connect to database',e);
    }
}

module.exports = {connect}