const express = require('express')
const AuthService = require('./auth-service')
const HomesService = require('../homes/homes-service')

const authHomeRouter = express.Router()
const jsonBodyParser = express.json()

//validate if home access credentials are correct
authHomeRouter
    .post('/login', jsonBodyParser, (req, res, next) => {
        const { home_name, password } = req.body
        const loginHome = { home_name, password }

        //home_name and password are required
        for(const [key, value] of Object.entries(loginHome)) {
            if(value == null){
                return res.status(400).json({
                    error: `Missing ${key} in request body`
                })
            }
        }

        //get home information from database
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

            //if home found compare input password with db password
            return AuthService.comparePasswords(loginHome.password, dbHome.password)
                .then(compareMatch => {
                    if(!compareMatch) {
                        return res.status(400).json({
                            error: 'Incorrect password'
                        })
                    }

                    //return home object
                    res.send(HomesService.serializeHome(dbHome))
                })
        })
        .catch(next)
    })

module.exports = authHomeRouter