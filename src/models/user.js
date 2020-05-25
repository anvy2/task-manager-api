const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwb = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        default: 18,
        validate(value) {
            if (value <= 0) {
                throw new Error('Age must be positive number')
            }
        }
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid Email')
            }
            }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if(value.includes('password')) {
                throw new Error('Password must not contain the word password')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

userSchema.virtual('tasks',  {
    ref: 'tasks',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function () {
    const user = this 
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this

    const token = jwb.sign({_id: user._id.toString()}, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token

}



userSchema.statics.findByCredentials = async (email, password) => {
    // console.log({email})
    // console.log(user)
    const userf = await user.findOne({ email })
    // return userf
    if (!userf) {
        // console.log('email') 
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, userf.password)

    if (!isMatch) {
        // console.log('password')
        throw new Error('Unable to login')
    }
    return userf
}


userSchema.pre('save', async function (next) {
    const userd = this 

    if (userd.isModified('password')) {
        userd.password = await bcrypt.hash(userd.password, 8)
    }

    next()
})

userSchema.pre('remove', async function (next) {
    const userd = this
    await Task.deleteMany({owner: userd._id})

    next()
})

const user = mongoose.model('User', userSchema)
module.exports = user