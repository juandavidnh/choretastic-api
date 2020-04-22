const express = require('express')
const path = require('path')
const HomesService = require('./homes-service')
const { requireAuthUserOnly } = require('../middleware/jwt-auth-user')

const homesRouter = express.Router()
const jsonBodyParser = express.json()

homesRouter
    //add home created by user
    .route('/add-home')
    //require token and validate from user who has not been assigned a home
    .all(requireAuthUserOnly)
    .post( jsonBodyParser, (req, res, next) => {
        const { home_name, password } = req.body

        //home_name and password are required
        for (const field of ['home_name', 'password']){
            if(!req.body[field]){
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
                })
            }
        }

        //validate if password follows requirements
        const passwordError = HomesService.validatePassword(password)

        if(passwordError){
            return res.status(400).json({error: passwordError})
        }

        //validate if home already exists, if it does, return error
        HomesService.hasHomeWithHomeName(
            req.app.get('db'),
            home_name
        )
            .then(hasHomeWithHomeName => {
                if(hasHomeWithHomeName){
                    return res.status(400).json({error: `Home already exists, try joining it`})
                } else {
                    return HomesService.hashPassword(password)
                        //encrypt password
                        .then(hashedPassword => {
                            const newHome = {
                                home_name,
                                password: hashedPassword,
                                date_created: 'now()',
                            }

                            //insert newHome into database
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