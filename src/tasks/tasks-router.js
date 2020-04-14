const express = require('express')
const path = require('path')
const TasksService = require('./tasks-service')
const AuthService = require('../auth/auth-service')
const UsersService = require('../users/users-service')
const { requireAuthUserHome } = require('../middleware/jwt-auth-user')

const tasksRouter = express.Router()
const jsonBodyParser = express.json()

tasksRouter
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

            return TasksService.getTasksFromHome(req.app.get('db'), user.home_id)
            .then(tasks => {
                if(tasks.length < 1){
                    return res.status(204).end()
                }
                res.json(tasks.map(task => TasksService.serializeTask(task)))
            })
        })
        .catch(next)
    })
    .post(jsonBodyParser, (req, res, next) => {
        const { task_name, assignee_id } = req.body
        const points = parseInt(req.body.points)
        const newTask = {task_name, assignee_id, points}

        for (const field of ['task_name', 'assignee_id', 'points']){
            if(!req.body[field]){
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
                })
            }
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
        .then( user => {
            if(!user){
                return res.status(401).json({ error: 'Unauthorized request' })
            } else if(user.home_id == null ){
                return res.status(401).json({ error: 'Unauthorized request' })
            }

            newTask.home_id = user.home_id

            TasksService.insertTask(
                req.app.get('db'),
                newTask
            )
            .then(task => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${task.id}`))
                    .json(TasksService.serializeTask(task))
                })
        })
        .catch(next)
    })

    tasksRouter
        .route('/own')
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
                }
    
                return TasksService.getTasksFromUser(req.app.get('db'), user.id)
                .then(tasks => {
                    if(tasks.length < 1){
                        return res.status(204).end()
                    }
                    res.json(tasks.map(task => TasksService.serializeTask(task)))
                })
            })
            .catch(next)
        })

    tasksRouter
        .route('/:id')
        .all(requireAuthUserHome)
        .all((req, res, next) => {
            TasksService.getById(
                req.app.get('db'),
                req.params.id
            )
            .then(task => {
                if(!task) {
                    return res.status(404).json({
                        error: {message: `Task doesn't exist`}
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
                    .then(user => {
                        if(user.home_id !== task.home_id){
                            return res.status(401).json({ error: 'Unauthorized request'})
                        } else {
                            res.task = task
                            next()
                        }
                    }
                    )
            })
            .catch(next)
        })
        .get((req, res, next) => {
            res.json(TasksService.serializeTask(res.task))
        })
        .delete((req, res, next) => {
            TasksService.deleteTask(
                req.app.get('db'),
                req.params.id
            )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
        })
        .patch(jsonBodyParser, (req, res, next) => {
            const { task_name, status, assignee_id, home_id, points, date_completed } = req.body

            const updatedTask = { task_name, status, assignee_id, home_id, points, date_completed }

            const numberOfValues = Object.values(updatedTask).filter(Boolean).length
            if(numberOfValues === 0){
                return res.status(400).json({
                    error:{
                        message: `Request must contain at least one value to update`        
                    }
                })
            }

            TasksService.updateTask(
                req.app.get('db'),
                req.params.id,
                updatedTask
            )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)

        })

module.exports = tasksRouter