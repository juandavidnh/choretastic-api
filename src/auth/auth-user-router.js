const express = require('express')
const AuthService = require('./auth-service')

const authUserRouter = express.Router()
const jsonBodyParser = express.json()

//validate if user access credentials are correct
authUserRouter
    .post('/login', jsonBodyParser, (req, res, next) => {
        const { email, password } = req.body
        const loginUser = { email, password }

        //email and password are required
        for(const [key, value] of Object.entries(loginUser)) {
            if(value == null){
                return res.status(400).json({
                    error: `Missing ${key} in request body`
                })
            }
        }

        //look for matching user within database
        AuthService.getUserWithEmail(
            req.app.get('db'),
            loginUser.email
        )
        .then(dbUser => {
            if(!dbUser) {
                return res.status(400).json({
                    error: 'Incorrect email or password',
                })
            }

            //verify that the input password is the same as db password
            return AuthService.comparePasswords(loginUser.password, dbUser.password)
                .then(compareMatch => {
                    if(!compareMatch) {
                        return res.status(400).json({
                            error: 'Incorrect email or password'
                        })
                    }

                    const sub = dbUser.email
                    const payload = { 
                        user_id: dbUser.id,
                    }

                    //generate jwt token
                    res.send({
                        authToken: AuthService.createJwt(sub, payload)
                    })
                })
        })
        .catch(next)
    })

module.exports = authUserRouter