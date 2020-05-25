const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const User = require('../models/user')
const sharp = require('sharp')
const { sendWelcomeEmail } = require('../emails/account')

router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        await sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()

        res.status(201).send({ user, token })
    } catch (err) {
        res.status(400).send(err)
        }

})
const avatar = multer({
    // dest: 'avatar',
    limits: { 
        fileSize: 10000000
    },
    fileFilter(res, file,  cb) {
        // cb(new Error('File must be a pdf'))
        // cb(undefined, true)
        if(!file.originalname.match(/\.(jpg|jpeg)/)){
            return cb(new Error('File not an Image'))
        }
        cb(undefined, true)
        
    }
})


router.post('/users/me/avatar', auth, avatar.single('upload'), async (req, res) => {
    // req.user.avatar = req.file.buffer
    const buffer = await sharp(req.file.buffer).png().resize({ width: 250, height: 250 }).toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (err, req, res, next) => {
    res.status(400).send({error: err.message})
})

router.delete('/users/me/avatar', auth, async(req, res) => {
    
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.send(req.user)
    } catch (err) {
        res.status(500).send()
        }
})


router.post('/users/login', async (req, res) => {
    try {
        
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        // console.log(req.body)
        res.send({user, token})
    } catch (err) {
        res.status(400).send()
        }
})

router.get('/users/email/:email', async(req, res) => {
    const email = req.params.email
    try {
        const user = await User.findOne({ email })

        if(!user) {
            return res.status(400).send()
        }
        res.send(user)

    } catch (err) {
        res.status(400).send(err)
        }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token != req.token)
        await req.user.save()
        res.send()
    } catch (err) {
        req.status(500).send()
        }
})

router.post('/users/logoutall', auth, async(req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (err) {
        res.status(500).send()
        }
})

router.get('/users/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const user = await User.findById(_id)
        if(!user) {
            return res.status(400).send()
        }
        res.send(user)
    } catch (err) {
        res.status(500).send(err)
        }
    
})

router.delete('/users/me', auth, async(req, res) => {
    try {

        await req.user.remove()
        res.send(req.user)
    } catch (err) {
        res.status(500).send(err)
        }
})

router.patch('/users/me', auth , async (req, res) => {
    const updates = Object.keys(req.body)
    const allowed = ['name', 'email', 'password']
    const isvalid = updates.every((update) => allowed.includes(update))
    
    if (!isvalid) {
        return res.status(400).send({error: 'Invalid Updates'})
    }

    try {

        updates.forEach((update) => {
            req.user[update] = req.body[update]
        })

        await req.user.save()
        // if(!user) {
        //     return res.status(404).send()
        // }
        res.send(req.user)
    } catch (err) {
        res.status(400).send(err)
        }
})

router.get('/users/:id/avatar', async (req, res) => {
    
    try {
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar)
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (err) {
        res.status(404).send()
        }
})

module.exports = router