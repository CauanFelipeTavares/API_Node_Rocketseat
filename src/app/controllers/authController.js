const express = require('express')
const User = require('../models/user')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authConfig = require('../../config/auth.json')
const crypto = require('crypto')
const mailer = require('../../modules/mailer')

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400,
    })
}


router.post('/register', async (req,res) => {
    const { email } = req.body

    try {
        if (await User.findOne({ email })) 
            return res.status(400).send({ error: 'Email já existente'}) 

        const user = await User.create(req.body)

        user.password = undefined

        return res.send({
            user,
            token: generateToken({ id: user.id }),
        })

    } catch(error) {
        console.log(error)
        return res.status(400).send({ error: 'Falha ao registrar'})
    }
})

router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')

    if(!user)
    return res.status(400).send({ error: "Usuário não encontrado"})

    if(!await bcrypt.compare(password, user.password))
    return res.status(400).send({ error: "Senha inválida"})

    user.password = undefined

    const token = 

    res.send({ 
        user,
        token: generateToken({ id: user.id }),
    })

} )

router.post('/forgot_password', async (req,res) => {
    const { email } = req.body

    try {
        const user = await User.findOne({ email })

        if(!user)
        return res.status(400).send({ error: "Usuário não encontrado"})

        const token = crypto.randomBytes(20).toString('hex')

        const now = new Date()
        now.setHours(now.getHours() + 1)

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now,
            }
        })

        //console.log(token, now)
        mailer.sendMail({
            to: email,
            from: "tavarescauanf@gmail.com",
            template: 'auth/forgot_password',
            context: { token },
        }, (erro) => {
            if(erro)
            return res.status(400).send({ error: "Não foi possível enviar o email de recuperação de senha"})

            return res.send()
        })
    } catch (erro) {
        res.status(400).send({error: 'Erro ao recuperar senha, tente novamente'})
    }
})

router.post('/reset_password', async (req, res) => {
    const { email, token, password } = req.body

    try {
        const user = await User.findOne({ email })
            .select('+passwordResetToken passwordResetExpires')

        if(!user)
            return res.status(400).send({ error: "Usuário inexistente" })

        if(token !== user.passwordResetToken)
            return res.status(400).send({ error: "Token inválido" })

        const now = new Date()
        if(now > user.passwordResetExpires)
            return res.status(400).send({ error: "O token expirou, gere um novo" })

        user.password = password

        await user.save()

        res.send()


    } catch (erro) {
        res.status(400).send({ error: "Não foi possível resetar a senha, tente novamente"})

    }
})

module.exports = app => app.use('/auth', router)