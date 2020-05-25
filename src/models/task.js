const mongoose = require('mongoose')
const validator = require('validator')


const taskSchema = new mongoose.Schema( {
    description: {
        type: String,
        trim: true,
        required: true
    },
    completed: { 
        type: Boolean,
        default: false
    }, 
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    }
}, {
    timestamps: true
})
const tasks = mongoose.model('tasks', taskSchema)

module.exports = tasks