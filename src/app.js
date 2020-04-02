require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV, CLIENT_ORIGIN } = require('./config')
//const tasksRouter = require('./tasks/tasks-router')
const homesRouter = require('./homes/homes-router')
const usersRouter = require('./users/users-router')
//const authRouter = require('./auth/auth-router')
//const authHomesRouter = require('./auth-homes/auth-homes-router')

const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'dev';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors({
    origin: CLIENT_ORIGIN
}))

//app.use('/api/tasks', tasksRouter)
//app.use('/api/auth-homes', authHomesRouter)
app.use('/api/homes', homesRouter)
//app.use('/api/auth', authRouter)
app.use('/api/users', usersRouter)

app.get('/', (req, res) => {
    res.send('Hello, boilerplate!')
})

app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
        console.error(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response)
})

module.exports = app