let lib = require('./lib')
let db = require('./db')

let serveSessionData = function (env) {
    lib.serveJson(env.res, {
        session: env.session,
        login: env.sessionData.login,
        firstName: env.sessionData.firstName,
        role: env.sessionData.role
    })
}

module.exports = {
    handle: function (env) {
        switch (env.req.method) {
            case 'GET':
                serveSessionData(env)
                break
            case 'POST':
                db.userCollection.findOne({email: env.parsedPayload.login}, function (err, result) {
                    if (err || !result) {
                        lib.serveError(env.res, 401, 'Authorization failed')
                    } else {
                        db.credentialCollection.findOne({user_id: result._id}, function (err, result2) {
                            if (err || !result2 || result2.password !== env.parsedPayload.password) {
                                lib.serveError(env.res, 401, 'Authorization failed')
                            } else {
                                env.sessionData.login = env.parsedPayload.login
                                env.sessionData.firstName = result.firstName
                                env.sessionData.role = result2.role
                                serveSessionData(env)
                            }
                        })
                    }
                })
                break
            case 'DELETE':
                delete env.sessionData.login
                delete env.sessionData.firstName
                delete env.sessionData.role
                serveSessionData(env)
                break
            default:
                lib.serveError(env.res, 405, 'Method not implemented')
                return
        }
    }
}