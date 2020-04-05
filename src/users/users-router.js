const express = require('express')
const path = require('path')
const UsersService = require('./users-service')
const { requireAuthUserHome, requireAuthUserOnly } = require('../middleware/jwt-auth-user')

const usersRouter = express.Router()
const jsonBodyParser = express.json()

usersRouter
    .route('/')
    .all(requireAuthUserHome)
    .get((req, res, next) => {
        UsersService.getAllUsers(req.app.get('db'))
            .then(users => {
                if(users.length < 1){
                    return res.status(204).end()
                }
                res.json(users.map(user => UsersService.serializeUser(user)))
            })
            .catch(next)
    })

usersRouter
    .route('/')
    .post(jsonBodyParser, (req, res, next) => {
        const { email, password, first_name, last_name, nickname } = req.body

        for (const field of ['email', 'password', 'first_name', 'last_name']){
            if(!req.body[field]){
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
                })
            }
        }

        const passwordError = UsersService.validatePassword(password)

        if(passwordError){
            return res.status(400).json({error: passwordError})
        }

        UsersService.hasUserWithEmail(
            req.app.get('db'),
            email
        )
            .then(hasUserWithEmail => {
                if(hasUserWithEmail){
                    return res.status(400).json({error: `User already exists, try signing in`})
                } else {
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

                            return UsersService.insertUser(
                                req.app.get('db'),
                                newUser
                            )
                                .then(user => {
                                    res
                                        .status(201)
                                        .location(path.posix.join(req.originalUrl, `/${user.id}`))
                                        .json(UsersService.serializeUser(user))
                                })
                        })
                }

            })
            .catch(next)
    })

usersRouter
    .route('/:id')
    .all(requireAuthUserOnly)
    .all((req, res, next) => {
        UsersService.getById(
            req.app.get('db'),
            req.params.id
        )
            .then(user => {
                if(!user){
                    return res.status(400).json({
                        error: {message: `User doesn't exist`}
                    })
                }
                res.user = user;
                next();
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(UsersService.serializeUser(res.user))
    })
    .patch(jsonBodyParser, (req, res, next) => {
        const { email, password, first_name, last_name, nickname, home_id } = req.body

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
                    home_id
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
                    res.status(204).end()
                })
            })
            .catch(next)
    })

usersRouter
    .route('/:id')
    .all(requireAuthUserHome)
    .all((req, res, next) => {
        UsersService.getById(
            req.app.get('db'),
            req.params.id
        )
            .then(user => {
                if(!user){
                    return res.status(400).json({
                        error: {message: `User doesn't exist`}
                    })
                }
                res.user = user;
                next();
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


module.exports = usersRouter