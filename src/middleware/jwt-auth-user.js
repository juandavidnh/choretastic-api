const AuthService = require('../auth/auth-service')

function requireAuthUserHome(req, res, next) {
    const authToken = req.get('Authorization') || ''

    let bearerToken
    if(!authToken.toLowerCase().startsWith('bearer ')) {
        return res.status(401).json({ error: 'Missing bearer token'})
    } else {
        bearerToken = authToken.slice(7, authToken.length)
    }

    try {
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

            req.user = user
            next()
        })
        .catch(err => {
            console.error(err)
            next(err)
        })

    } catch(error) {
        res.status(401).json({ error: 'Unauthorized request'})
    }
}

function requireAuthUserOnly(req, res, next) {
    const authToken = req.get('Authorization') || ''

    let bearerToken
    if(!authToken.toLowerCase().startsWith('bearer ')) {
        return res.status(401).json({ error: 'Missing bearer token'})
    } else {
        bearerToken = authToken.slice(7, authToken.length)
    }

    try {
        const payload = AuthService.verifyJwt(bearerToken)

        AuthService.getUserWithEmail(
            req.app.get('db'),
            payload.sub
        )
        .then(user => {
            if(!user){
                return res.status(401).json({ error: 'Unauthorized request' })
            }

            req.user = user
            next()
        })
        .catch(err => {
            console.error(err)
            next(err)
        })

    } catch(error) {
        res.status(401).json({ error: 'Unauthorized request'})
    }
}

module.exports = {
    requireAuthUserHome,
    requireAuthUserOnly
}