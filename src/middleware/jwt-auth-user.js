const AuthService = require('../auth/auth-service')

//authentication for users that have been assigned a home
function requireAuthUserHome(req, res, next) {
    //get 'Authorization' token from request header
    const authToken = req.get('Authorization') || ''

    let bearerToken
    if(!authToken.toLowerCase().startsWith('bearer ')) {
        return res.status(401).json({ error: 'Missing bearer token'})
    } else {
        bearerToken = authToken.slice(7, authToken.length)
    }

    try {
        //read payload from jwt token
        const payload = AuthService.verifyJwt(bearerToken)

        //payload.sub should be an email in the users database
        AuthService.getUserWithEmail(
            req.app.get('db'),
            payload.sub
        )
        .then(user => {
            if(!user){
                return res.status(401).json({ error: 'Unauthorized request' })
            }
            //if user exists but hasn't been assigned a home, request will be rejected 
            else if(user.home_id == null ){
                return res.status(401).json({ error: 'Unauthorized request' })
            } 

            //pass user down
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

//authentication for users that haven't been assigned a home
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
            //if user exists, he will be authorized regardless of whether he has a home or not

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