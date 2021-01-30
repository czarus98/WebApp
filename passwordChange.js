let lib = require('./lib')
let db = require('./db')
let mongodb = require('mongodb')
let bcrypt = require('bcrypt')

let serveSessionData = function (env) {
    lib.serveJson(env.res, {
        email: env.parsedPayload.email
    })
}

module.exports = {

    handle: function (env) {
        let _id = null
        if (env.parsedUrl.query._id) {
            try {
                _id = mongodb.ObjectID(env.parsedUrl.query._id)
            } catch (ex) {
                lib.serveError(env.res, 406, '_id ' + env.parsedUrl.query._id + ' is not valid')
                return
            }
        }

        switch (env.req.method) {
            case 'PUT':
                if(env.parsedPayload.newPassword !== env.parsedPayload.repeatPassword) {
                     lib.serveError(env.res, 400, 'Passwords do not match')
                } else {
                    bcrypt.genSalt(10, function (err, salt) {
                        bcrypt.hash(env.parsedPayload.newPassword, salt, function (err, hash) {
                            if (err) throw err

                            db.credentialCollection.findOneAndUpdate({email: env.parsedPayload.email},
                                {$set: {password: hash}},
                                {returnOriginal: true},
                                function (err, result) {
                                    if (err || !result.value) {
                                        lib.serveError(env.res, 404, 'User not found')
                                    } else {
                                        serveSessionData(env)
                                    }
                                })
                        })
                    })
                }
                break
            default:
                lib.serveError(env.res, 405, 'Method not implemented')
                return
        }
    }
}