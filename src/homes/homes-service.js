const bcrypt = require('bcryptjs')
const xss = require('xss')

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/

const HomesService = {
    getAllHomes(db) {
        return db.select('*').from('choretastic_homes')
    },
    
    hasHomeWithHomeName(db, home_name) {
        return db('choretastic_homes')
            .where({ home_name })
            .first()
            .then(home => !!home)
    },

    getById(db, homeId) {
        return db   
            .from('choretastic_homes')
            .select('*')
            .where('id', homeId)
            .first()
    },

    insertHome(db, newHome) {
        return db
            .insert(newHome)
            .into('choretastic_homes')
            .returning('*')
            .then(([home]) => home)
    },

    updateHome(db, homeId, updatedHome) {
        return db 
            .from('choretastic_homes')
            .where({id: homeId})
            .update(updatedHome)
    },

    deleteHome(db, homeId) {
        return db 
            .from('choretastic_homes')
            .where({id: homeId})
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

    serializeHome(home) {
        return {
            id: home.id,
            home_name: xss(home.home_name),
            password: xss(home.password),
            date_created: new Date(home.date_created),
        }
    }
}

module.exports = HomesService