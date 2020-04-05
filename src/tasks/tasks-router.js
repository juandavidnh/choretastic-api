const express = require('express')
const path = require('path')
const TasksService = require('./tasks-service')
const { requireAuthUserHome } = require('../middleware/jwt-auth-user')

const tasksRouter = express.Router()
const jsonBodyParser = express.json()

tasksRouter
    .route('/')
    .all(requireAuthUserHome)
    .get((req, res, next) => {
        TasksService.getAllTasks(req.app.get('db'))
            .then(tasks => {
                if(tasks.length < 1){
                    return res.status(204).end()
                }
                res.json(tasks.map(TasksService.serializeTask))
            })
            .catch(next)
    })
    .post(jsonBodyParser, (req, res, next) => {
        const { task_name, assignee_id, home_id } = req.body
        const points = parseInt(req.body.points)
        const newTask = {task_name, assignee_id, home_id, points}

        for (const field of ['task_name', 'assignee_id', 'home_id', 'points']){
            if(!req.body[field]){
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
                })
            }
        }
            
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

                res.task = task
                next()
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