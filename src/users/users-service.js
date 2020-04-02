const bcrypt = require('bcryptjs')
const xss = require('xss')

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/

const UsersService = {
    getAllUsers(db) {
        return db.select('*').from('choretastic_users')
    },

    hasUserWithEmail(db, email) {
        return db('choretastic_users')
            .where({ email })
            .first()
            .then(user => !!user)
    },

    insertUser(db, newUser) {
        return db
            .insert(newUser)
            .into('choretastic_users')
            .returning('*')
            .then(([user]) => user)
    },

    getById(db, userId) {
        return db   
            .from('choretastic_users')
            .select('*')
            .where('id', userId)
            .first()
    },

    updateUser(db, userId, updatedUser) {
        return db 
            .from('choretastic_users')
            .where({id: userId})
            .update(updatedUser)
    },

    deleteUser(db, userId) {
        return db 
            .from('choretastic_users')
            .where({id: userId})
            .delete()
    },

    validatePassword(password) {
        if (password.length < 8) {
            return 'Password must be longer than 8 characters'
        }
        if(password.length > 72) {
            return 'Password must be less than 72 characters'
        }
        if(password.startsWith(' ') || password.endsWith(' ')) {
            return 'Password must not start or end with empty spaces'
        }
        if(!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
            return 'Password must contain one upper case, lower case, number and special character'
        }
        return null
    },

    hashPassword(password) {
        return bcrypt.hash(password, 12)
    },

    serializeUser(user) {
        return {
            id: user.id,
            first_name: xss(user.first_name),
            last_name: xss(user.last_name),
            nickname: xss(user.nickname),
            email: xss(user.email),
            password: xss(user.password),
            points: user.points,
            home_id: user.home_id,
            date_created: new Date(user.date_created),
        }
    },
}

module.exports = UsersService

