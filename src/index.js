const express = require('express')

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.get('/', (req,res) => {
    res.send('ok')
})

 require('./app/controllers/index')(app)

app.listen(8181, () => {
    console.log("Rodando em http://localhost:8181")
})