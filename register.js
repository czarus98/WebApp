let lib = require('./lib')
let db = require('./db')

let serveSessionData = function (env) {
    lib.serveJson(env.res, {
        login: env.parsedPayload.login,
        firstName: env.parsedPayload.firstName,
        lastName: env.parsedPayload.lastName,
        year: env.parsedPayload.year,
        password: lib.cryptPassword(env.parsedPayload.password)
    })
}

module.exports = {
    handle: function (env) {
        switch (env.req.method) {
            case 'GET':
                serveSessionData(env)
                break
            case 'POST':
                db.userCollection.findOne({email: env.parsedPayload.login}, function (err, result1) {
                        if (err || !result1) {
                            lib.serveError(env.res, 401, 'registration failed, email exists')
                        } else {
                            db.userCollection.insertOne({
                                firstName: env.parsedPayload.firstName,
                                lastName: env.parsedPayload.lastName,
                                email: env.parsedPayload.login,
                                year: env.parsedPayload.year,
                                role: 2
                            }, function (err, insertResult) {
                                if (err || !insertResult.ops || !insertResult.ops[0]) {
                                    lib.serveError(env.res, 400, 'Insert to users failed')
                                } else {
                                    let user = db.userCollection.findOne({email: env.parsedPayload.login})
                                    lib.serveJson(env.res, insertResult.ops[0])
                                    db.credentialCollection.insertOne({
                                        user_id: user._id,
                                        password: env.parsedPayload.password,
                                        role: 2
                                    }, function (err, credInsertResult) {
                                        if (err || !credInsertResult.ops || !credInsertResult.ops[0]) {
                                            lib.serveError(env.res, 400, 'Insert to credentials failed')
                                        } else {
                                            lib.serveJson(env.res, credInsertResult.ops[0])
                                        }
                                    })
                                }
                            })
                        }
                    }
                )
                break
            case 'DELETE':
                delete env.sessionData.login
                delete env.sessionData.firstName
                delete env.sessionData.lastName
                delete env.sessionData.password
                delete env.sessionData.role
                delete env.sessionData._id
                serveSessionData(env)
                break
            default:
                lib.serveError(env.res, 405, 'Method not implemented')
                return
        }
    }
}
