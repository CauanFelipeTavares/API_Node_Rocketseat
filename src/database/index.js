const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/rocketapi')

mongoose.Promise = global.Promise

module.exports = mongoose