const express = require('express')
const path = require('path')
const TasksService = require('./tasks-service')
const AuthService = require('../auth/auth-service')
const { requireAuthUserHome } = require('../middleware/jwt-auth-user')

const tasksRouter = express.Router()
const jsonBodyParser = express.json()

tasksRouter
    .route('/')
    .all(requireAuthUserHome)
    //get task list
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

            //filter out tasks that don't belong to user's home
            return TasksService.getTasksFromHome(req.app.get('db'), user.home_id)
            .then(tasks => {
                if(tasks.length < 1){
                    return res.status(200).json("Enter your first task")
                }
                res.json(tasks.map(task => TasksService.serializeTask(task)))
            })
        })
        .catch(next)
    })
    //add new task
    .post(jsonBodyParser, (req, res, next) => {
        const { task_name, assignee_id } = req.body
        const points = parseInt(req.body.points)
        const newTask = {task_name, assignee_id, points}

        //task_name, assignee_id, and points are required
        for (const field of ['task_name', 'assignee_id', 'points']){
            if(!req.body[field]){
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
                })
            }
        }

        //get user from token
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

            //assign task to user's home
            newTask.home_id = user.home_id

            //insert task
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

    //get own tasks only
    tasksRouter
        .route('/own')
        //require user and home validation
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
            
            //get user's email from token
            AuthService.getUserWithEmail(
                req.app.get('db'), 
                payload.sub
            )
            .then(user => {
                if(!user){
                    return res.status(401).json({ error: 'Unauthorized request' })
                }
                
                //get tasks from logged in user
                return TasksService.getTasksFromUser(req.app.get('db'), user.id)
                .then(tasks => {
                    if(tasks.length < 1){
                        return res.status(200).json("Enter your first task")
                    }
                    res.json(tasks.map(task => TasksService.serializeTask(task)))
                })
            })
            .catch(next)
        })

    tasksRouter
        .route('/:id')
        //require user with home authentication
        .all(requireAuthUserHome)
        .all((req, res, next) => {
            //search specific task 
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
                        //if task doesn't belong to logged in user, reject request
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
            //return task object
            res.json(TasksService.serializeTask(res.task))
        })
        .delete((req, res, next) => {
            TasksService.deleteTask(
                req.app.get('db'),
                req.params.id
            )
            .then(() => {
                res.status(200).json('OK')
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
                res.status(200).json('OK')
            })
            .catch(next)

        })

module.exports = tasksRouter