const xss = require('xss')

const TasksService = {
    getAllTasks(db) {
        return db.select('*').from('choretastic_tasks')
    },

    hasTaskWithTaskName(db, task_name) {
        return db('choretastic_tasks')
            .where({ task_name })
            .first()
            .then(task => !!task)
    },

    insertTask(db, newTask) {
        return db
            .insert(newTask)
            .into('choretastic_tasks')
            .returning('*')
            .then(([task]) => task)
    },

    getById(db, taskId) {
        return db   
            .from('choretastic_tasks')
            .select('*')
            .where('id', taskId)
            .first()
    },

    updateTask(db, taskId, updatedTask) {
        return db 
            .from('choretastic_tasks')
            .where({id: taskId})
            .update(updatedTask)
    },

    deleteTask(db, taskId) {
        return db 
            .from('choretastic_tasks')
            .where({id: taskId})
            .delete()
    },

    serializeTask(task) {
        return {
            id: task.id,
            task_name: xss(task.task_name),
            status: xss(task.status),
            points: task.points,
            assignee_id: task.assignee_id,
            home_id: task.home_id,
            date_created: new Date(task.date_created),
            date_completed: new Date(task.date_completed),
        }
    },

    getTasksFromUser(db, user_id){
        return db
            .from('choretastic_tasks')
            .select('*')
            .where('assignee_id', user_id)
    },

    getTasksFromHome(db, home_id){
        return db
            .from('choretastic_tasks')
            .select('*')
            .where(home_id)
    }
}

module.exports = TasksService

