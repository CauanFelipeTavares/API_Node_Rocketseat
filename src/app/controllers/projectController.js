const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/auth')
const Project = require('../models/project')

//router.use(authMiddleware)

router.get('/a', (req,res) => {
    try{
        return res.send({teste: 'a'})
    } catch(erro){
        return res.status(400).send({ a: 'correto'})
    }
    
})

router.get('/', async (req, res) => {
    try {

        const projects = await Project.find().populate('user')

        return res.send({ projects })

    } catch (err) {
        return res.status(400).send({ error: 'Não foi possível listar seus projetos'})
    }
})

router.get('/:projectId', async (req,res) => {
    try {

        const project = await Project.findById(req.params.projectId).populate('user')

        return res.send({ project })

    } catch (err) {
        return res.status(400).send({ error: 'Não foi possível mostrar seu projeto'})
    }
})

router.post('/', async (req,res) => {
    try {
        const { title, description } = req.body

        const project = await Project.create({ title, description, user: req.userId})

        return res.send({ project })

    } catch (err) {
        console.log(err)
        return res.status(400).send({ error: 'Não foi possível criar um novo projeto'})
    }
})

router.put('/:projectId', async (req,res) => {
    try {

        const { title, description } = req.body

        await Project.findByIdAndUpdate(req.params.projectId, {title, description}, { new: true }).populate('user')

        return res.send({ project })

    } catch (err) {
        
        return res.status(400).send({ error: 'Não foi possível atualizar seu projeto'})
    }
})

router.delete('/:projectId', async (req,res) => {
    try {

        await Project.findByIdAndRemove(req.params.projectId).populate('user')

        return res.send()

    } catch (err) {
        return res.status(400).send({ error: 'Não foi possível deletar seu projeto'})
    }
})

module.exports = app => app.use('/projects', router)