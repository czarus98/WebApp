let lib = require('./lib')
let db = require('./db')
let bcrypt = require('bcrypt')

let serveSessionData = function (env) {
    lib.serveJson(env.res, {
        email: env.parsedPayload.email,
        firstName: env.parsedPayload.firstName,
        lastName: env.parsedPayload.lastName,
        year: env.parsedPayload.year
    })
}

module.exports = {
    handle: function (env) {
        switch (env.req.method) {
            case 'GET':
                serveSessionData(env)
                break
            case 'POST':
                db.userCollection.findOne({email: env.parsedPayload.email}, function (err, emailResult) {
                        if (!emailResult) {
                            db.userCollection.insertOne({
                                firstName: env.parsedPayload.firstName,
                                lastName: env.parsedPayload.lastName,
                                email: env.parsedPayload.email,
                                year: env.parsedPayload.year,
                                amount: 1000,
                                role: 2
                            }, function (err, insertResult) {
                                if (err || !insertResult.ops || !insertResult.ops[0]) {
                                    lib.serveError(env.res, 400, 'Insert to users failed')
                                } else {
                                    let _id = insertResult.ops[0]._id
                                    bcrypt.genSalt(10, function (err, salt) {
                                        bcrypt.hash(env.parsedPayload.password, salt, function (err, hash) {
                                            if (err) throw err
                                            db.credentialCollection.insertOne({
                                                user_id: _id,
                                                password: hash,
                                                role: 2
                                            }, function (err, credInsertResult) {
                                                if (err || !credInsertResult.ops || !credInsertResult.ops[0]) {
                                                    lib.serveError(env.res, 400, 'Insert to credentials failed')
                                                } else {
                                                    let now = new Date().getTime()
                                                    let delta = 1000
                                                    db.historyCollection.insertOne({
                                                        date: now,
                                                        sender: '',
                                                        recipient: _id,
                                                        delta: delta,
                                                        amount_after: delta
                                                    }, function (err, historyInsertResult) {
                                                        if(historyInsertResult) {
                                                            serveSessionData(env)
                                                        } else {
                                                            lib.serveError(env.res, 400, 'Insert to history failed')
                                                        }
                                                    })
                                                }
                                            })

                                        })
                                    })
                                }
                            })
                        } else {
                            lib.serveError(env.res, 401, 'registration failed, email exists')
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
