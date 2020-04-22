const express = require('express')
const path = require('path')
const UsersService = require('./users-service')
const AuthService = require('../auth/auth-service')
const { requireAuthUserHome, requireAuthUserOnly } = require('../middleware/jwt-auth-user')

const usersRouter = express.Router()
const jsonBodyParser = express.json()

usersRouter
    //get user list
    .route('/')
    .all(requireAuthUserHome)
    .get((req, res, next) => {
        const authToken = req.get('Authorization') || ''

        let bearerToken
        if(!authToken.toLowerCase().startsWith('bearer ')) {
            return res.status(401).json({ error: 'Missing bearer token'})
        } else {
            bearerToken = authToken.slice(7, authToken.length)
        }

        const payload = AuthService.verifyJwt(bearerToken)

        AuthService.getUserWithEmail(
            req.app.get('db'), 
            payload.sub
        )
        .then(user => {
            if(!user){
                return res.status(401).json({ error: 'Unauthorized request' })
            } else if(user.home_id == null ){
                return res.status(401).json({ error: 'Unauthorized request' })
            } 

            //filter only users from user's home
            return UsersService.getUsersFromHome(req.app.get('db'), user.home_id)
            .then(users => {
                if(users.length < 1){
                    return res.status(204).end()
                }
                res.json(users.map(user => UsersService.serializeUser(user)))
            })
        })
        .catch(next)
    })

usersRouter
    //add user to user's home
    .route('/add-user')
    .all(requireAuthUserHome)
    .post(jsonBodyParser, (req, res, next) => {
        const { first_name, last_name, nickname, email, password } = req.body
        const newUser = { first_name, last_name, nickname, email, password }

        //require first_name, last_name, email, and password
        for (const field of ['first_name', 'last_name', 'email', 'password']){
            if(!req.body[field]){
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
                })
            }
        }

        //verify if password satisfies conditions
        const passwordError = UsersService.validatePassword(password)

        if(passwordError){
            return res.status(400).json({error: passwordError})
        }

        const authToken = req.get('Authorization') || ''

        let bearerToken
        if(!authToken.toLowerCase().startsWith('bearer ')) {
            return res.status(401).json({ error: 'Missing bearer token'})
        } else {
            bearerToken = authToken.slice(7, authToken.length)
        }

        const payload = AuthService.verifyJwt(bearerToken)

        //payload.sub should be an email of a user within database
        AuthService.getUserWithEmail(
            req.app.get('db'), 
            payload.sub
        )
        .then( user => {
            if(!user){
                return res.status(401).json({ error: 'Unauthorized request' })
            } else if(user.home_id == null ){
                return res.status(401).json({ error: 'Unauthorized request' })
            }

            //assign logged in user's home_id to new user
            newUser.home_id = user.home_id

            //add new user
            return UsersService.insertUser(
                req.app.get('db'),
                newUser
            )
            .then(user => {
                res
                    .status(201)
                    .location(path.posix.join(`/api/users/user-id/${user.id}`))
                    .json(UsersService.serializeUser(user))
                })
        })
        .catch(next)
    })

usersRouter
    //sign up new user
    .route('/sign-up')
    .post(jsonBodyParser, (req, res, next) => {
        const { email, password, first_name, last_name, nickname } = req.body

        //require first_name, last_name, email, and password
        for (const field of ['email', 'password', 'first_name', 'last_name']){
            if(!req.body[field]){
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
                })
            }
        }
        
        //verify if password satisfies conditions
        const passwordError = UsersService.validatePassword(password)

        if(passwordError){
            return res.status(400).json({error: passwordError})
        }

        //user should not be in database
        UsersService.hasUserWithEmail(
            req.app.get('db'),
            email
        )
            .then(hasUserWithEmail => {
                if(hasUserWithEmail){
                    return res.status(400).json({error: `User already exists, try signing in`})
                } else {
                    //encrypt user's password
                    return UsersService.hashPassword(password)
                        .then(hashedPassword => {
                            const newUser = {
                                email,
                                password: hashedPassword,
                                first_name,
                                last_name,
                                nickname,
                                date_created: 'now()',
                            }

                            //add new user and generate jwt token
                            return UsersService.insertUser(
                                req.app.get('db'),
                                newUser
                            )
                                .then(user => {
                                    const sub = user.email
                                    const payload = {
                                        user_id: user.id
                                    }

                                    res.send({
                                        authToken: AuthService.createJwt(sub, payload)
                                    })
                                })
                        })
                }

            })
            .catch(next)
    })

usersRouter
    .route('/user-id/:id')
    //require auth user without home
    .all(requireAuthUserOnly)
    .all((req, res, next) => {
        //verify if user exists
        UsersService.getById(
            req.app.get('db'),
            req.params.id
        )
        .then(user => {
            if(!user) {
                return res.status(404).json({
                    error: {message: `User doesn't exist`}
                })
            }

            const authToken = req.get('Authorization') || ''

            let bearerToken
            if(!authToken.toLowerCase().startsWith('bearer ')) {
                return res.status(401).json({ error: 'Missing bearer token'})
            } else {
                bearerToken = authToken.slice(7, authToken.length)
            }

            const payload = AuthService.verifyJwt(bearerToken)

            AuthService.getUserWithEmail(
                req.app.get('db'), 
                payload.sub
                )
                .then(myUser => {
                    //deny request if user doesn't belong to same home
                    if(myUser.home_id !== user.home_id){
                        return res.status(401).json({ error: 'Unauthorized request'})
                    } else {
                        res.user = user
                        next()
                    }
                }
                )
        })
    })
    .get((req, res, next) => {
        res.json(UsersService.serializeUser(res.user))
    })
    .patch(jsonBodyParser, (req, res, next) => {
        const { email, password, first_name, last_name, nickname, home_id, points } = req.body

        if(password){
            const passwordError = UsersService.validatePassword(password)

            if(passwordError){
                return res.status(400).json({error: passwordError})
            }

            UsersService.hashPassword(password)
            .then(hashedPassword => {
                const updateToUser = {
                    email,
                    password: hashedPassword,
                    first_name,
                    last_name,
                    nickname,
                    home_id: home_id,
                    points: points
                }

                const numberOfValues = Object.values(updateToUser).filter(Boolean).length
                if(numberOfValues === 0) {
                    return res.status(400).json({
                    error: {
                        message: `Request must contain at least one value to update`
                        }
                    })
                }

                return UsersService.updateUser(
                    req.app.get('db'),
                    req.params.id,
                    updateToUser
                )
                .then(() => {
                    res.status(200).json('OK')
                })
            })
            .catch(next)
        }

        const updateToUser = {
            email,
            first_name,
            last_name,
            nickname,
            home_id: home_id,
            points: points
        }

        const numberOfValues = Object.values(updateToUser).filter(Boolean).length
        if(numberOfValues === 0) {
            return res.status(400).json({
            error: {
                message: `Request must contain at least one value to update`
                }
            })
        }

        return UsersService.updateUser(
            req.app.get('db'),
            req.params.id,
            updateToUser
        )
        .then(() => {
            res.status(200).json('OK')
        })
        .catch(next)

    })
    .delete((req, res, next) => {
        UsersService.deleteUser(
            req.app.get('db'),
            req.params.id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })

//get own user object
usersRouter
    .route('/own')
    .all(requireAuthUserOnly)
    .all((req, res, next) => {
        const authToken = req.get('Authorization') || ''

        let bearerToken
        if(!authToken.toLowerCase().startsWith('bearer ')) {
            return res.status(401).json({ error: 'Missing bearer token'})
        } else {
            bearerToken = authToken.slice(7, authToken.length)
        }

        //extract user from token
        const payload = AuthService.verifyJwt(bearerToken)

        AuthService.getUserWithEmail(
            req.app.get('db'), 
            payload.sub
            )
            .then(myUser => {
                if(!myUser){
                    return res.status(401).json({ error: 'User not found' })
                }
                res.user = myUser
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        //return user object
        res.json(UsersService.serializeUser(res.user))
    })



module.exports = usersRouter