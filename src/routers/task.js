const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Task = require('../models/task')


router.get('/tasks', auth, async(req, res) => {
    const match = {}
    // console.log(req.query.limit)
    if(req.query.completed) {
        match.completed = req.query.completed ==='true'
    }

    try {
        // const tasks = await Task.find({owner: req.user._id})
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip)
            }
        }).execPopulate()
        res.send(req.user.tasks)

    } catch (err) {
        res.status(500).send(err)
        }
})

router.get('/tasks/:id', auth, async(req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOneAndDelete({ _id, owner: req.user._id})

        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (err) {
        res.status(500).send()
        }
})

router.post('/tasks', auth, async (req, res) => {
    // const task = new Task(req.body)
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (err) {
        res.status(400).send(err)
        }
    // task.save().then(() => {
    //     res.status(201).send(task)
    // }).catch((err) => {
    //     res.status(400).send(err)
    // })
})


router.patch('/tasks/:id', auth, async(req, res) => {
    const updates = Object.keys(req.body)
    const allowed = ['completed', 'description']
    const isValid = updates.every((update) => allowed.includes(update))

    if(!isValid) {
        return res.status(400).send({error: "Invalid update request"})
    }
    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        // const task = await Task.findById
        if (!task) {
            return res.status(400).send()
        }
        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (err) {
        res.status(400).send(err)
        }
})



router.delete('/tasks/:id', auth, async(req, res) => {
    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})

        if (!task) {
            return res.status(404).send()
        }
        await task.delete()
        res.send(task)
    } catch (err) {
        res.status(500).send(err)
        }
})

module.exports = router