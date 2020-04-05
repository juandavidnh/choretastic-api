const express = require('express')
const AuthService = require('./auth-service')

const authHomeRouter = express.Router()
const jsonBodyParser = express.json()

authHomeRouter
    .post('/login', jsonBodyParser, (req, res, next) => {
        const { home_name, password } = req.body
        const loginHome = { home_name, password }

        for(const [key, value] of Object.entries(loginHome)) {
            if(value == null){
                return res.status(400).json({
                    error: `Missing ${key} in request body`
                })
            }
        }

        AuthService.getHomeWithHomeName(
            req.app.get('db'),
            loginHome.home_name
        )
        .then(dbHome => {
            if(!dbHome) {
                return res.status(400).json({
                    error: 'Home not found',
                })
            }

            return AuthService.comparePasswords(loginHome.password, dbHome.password)
                .then(compareMatch => {
                    if(!compareMatch) {
                        return res.status(400).json({
                            error: 'Incorrect password'
                        })
                    }

                    res.status(204).end()
                })
        })
        .catch(next)
    })

module.exports = authHomeRouter