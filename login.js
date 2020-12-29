let lib = require('./lib')
let db = require('./db')
let bcrypt = require("bcrypt");

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
                db.userCollection.findOne({email: env.parsedPayload.login}, function (err, result1) {
                    if (err || !result1) {
                        lib.serveError(env.res, 401, 'authorization failed')
                    } else {
                        db.credentialCollection.findOne({user_id: result1._id}, function (err, result2) {
                            if (!err || result2) {
                                bcrypt.compare(env.parsedPayload.password, result2.password, function (err, res) {
                                    if (res) {
                                        env.sessionData.login = env.parsedPayload.login
                                        env.sessionData.firstName = result1.firstName
                                        env.sessionData.role = result2.role
                                        env.sessionData._id = result1._id
                                        serveSessionData(env)
                                    } else {
                                        lib.serveError(env.res, 401, 'authorization failed')
                                    }
                                })
                            } else {
                                lib.serveError(env.res, 401, 'authorization failed')
                            }
                        })
                    }
                })
                break
            case 'DELETE':
                delete env.sessionData.login
                delete env.sessionData.firstName
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