const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    try {
        // console.log(req.header)
        const token = req.header('Authorization').replace('Bearer ', '')
        // console.log('something')
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        // console.log('something')
        const user = await User.findOne({ _id: decode._id, 'tokens.token': token })
        
        if(!user) {
            // console.log('user not found')
            throw new Error()
        }
        req.user = user
        req.token = token
        next()
        // console.log(token)
    } catch (err) {
        res.status(401).send({error: 'Auth unsuccessful'})
    }
}

module.exports = auth