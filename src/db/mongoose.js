const mongoose = require('mongoose')
const validator = require('validator')
// const path = require('path')

mongoose.connect(process.env.MONGODB_URL + '/task-manager-api', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})



// const me = new User({
//     name: 'Anvy',
//     age: 5,
//     email: 'an@gmial.com',
//     password: 'ieopassword'
// })

// me.save().then((result) =>    console.log(result)
// ).catch(
//     (err) => console.log(err)
// )