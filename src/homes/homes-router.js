const express = require('express')
const path = require('path')
const HomesService = require('./homes-service')
const { requireAuthUserHome, requireAuthUserOnly } = require('../middleware/jwt-auth-user')

const homesRouter = express.Router()
const jsonBodyParser = express.json()

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
                                        .location(path.posix.join(`/api/homes/${home.id}`))
                                        .json(HomesService.serializeHome(home))
                                })
                        })
                }

            })
            .catch(next)
    })


module.exports = homesRouter