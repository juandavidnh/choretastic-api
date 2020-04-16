const express = require('express')
const path = require('path')
const HomesService = require('./homes-service')
const { requireAuthUserHome, requireAuthUserOnly } = require('../middleware/jwt-auth-user')

const homesRouter = express.Router()
const jsonBodyParser = express.json()

homesRouter
    .route('/')
    .all(requireAuthUserHome)
    .get((req, res, next) => {
        HomesService.getAllHomes(req.app.get('db'))
            .then(homes => {
                if(homes.length < 1){
                    return res.status(204).end()
                }
                res.json(homes.map(home => HomesService.serializeHome(home)))
            })
            .catch(next)
    })

homesRouter
    .route('/add-home')
    .all(requireAuthUserOnly)
    .post( jsonBodyParser, (req, res, next) => {
        const { home_name, password } = req.body

        for (const field of ['home_name', 'password']){
            if(!req.body[field]){
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
                })
            }
        }

        const passwordError = HomesService.validatePassword(password)

        if(passwordError){
            return res.status(400).json({error: passwordError})
        }

        HomesService.hasHomeWithHomeName(
            req.app.get('db'),
            home_name
        )
            .then(hasHomeWithHomeName => {
                if(hasHomeWithHomeName){
                    return res.status(400).json({error: `Home already exists, try joining it`})
                } else {
                    return HomesService.hashPassword(password)
                        .then(hashedPassword => {
                            const newHome = {
                                home_name,
                                password: hashedPassword,
                                date_created: 'now()',
                            }

                            return HomesService.insertHome(
                                req.app.get('db'),
                                newHome
                            )
                                .then(home => {
                                    res
                                        .status(201)
                                        .location(path.posix.join(req.originalUrl, `/${home.id}`))
                                        .json(HomesService.serializeHome(home))
                                })
                        })
                }

            })
            .catch(next)
    })

homesRouter
    .route('/:id')
    .all(requireAuthUserHome)
    .all((req, res, next) => {
        HomesService.getById(
            req.app.get('db'),
            req.params.id
        )
            .then(home => {
                if(!home){
                    return res.status(400).json({
                        error: {message: `Home doesn't exist`}
                    })
                }
                res.home = home;
                next();
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(HomesService.serializeHome(res.home))
    })
    .patch(jsonBodyParser, (req, res, next) => {
        const { home_name, password } = req.body

        const passwordError = HomesService.validatePassword(password)

        if(passwordError){
            return res.status(400).json({error: passwordError})
        }

        HomesService.hashPassword(password)
            .then(hashedPassword => {
                const updateToHome = {
                    home_name,
                    password: hashedPassword,
                }

                const numberOfValues = Object.values(updateToHome).filter(Boolean).length
                if(numberOfValues === 0) {
                    return res.status(400).json({
                    error: {
                        message: `Request must contain at least one value to update`
                        }
                    })
                }

                return HomesService.updateHome(
                    req.app.get('db'),
                    req.params.id,
                    updateToHome
                )
                .then(() => {
                    res.status(204).end()
                })
            })
            .catch(next)
    })
    .delete((req, res, next) => {
        HomesService.deleteHome(
            req.app.get('db'),
            req.params.id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })



module.exports = homesRouter