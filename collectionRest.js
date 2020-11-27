let lib = require('./lib')
let mongodb = require('mongodb')

module.exports = {

    handle: function (env, collection) {
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
            case 'GET':
                if (_id) {
                    collection.findOne({_id: _id}, function (err, result) {
                        if (err || !result) {
                            lib.serveError(env.res, 404, 'User not found')
                        } else {
                            lib.serveJson(env.res, result)
                        }
                    })
                } else {
                    collection.find({}).toArray(function (err, result) {
                        lib.serveJson(env.res, result)
                    })
                }
                break
            case 'POST':
                collection.insertOne(env.parsedPayload, function (err, result) {
                    if (err || !result.ops || !result.ops[0]) {
                        lib.serveError(env.res, 400, 'Insert failed')
                    } else {
                        lib.serveJson(env.res, result.ops[0])
                    }
                })
                break
            case 'PUT':
                if (_id) {
                    delete env.parsedPayload._id
                    collection.findOneAndUpdate({_id: _id},
                        {$set: env.parsedPayload},
                        {returnOriginal: false},
                        function (err, result) {
                            if (err || !result.value) {
                                lib.serveError(env.res, 404, 'User not found')
                            } else {
                                lib.serveJson(env.res, result.value, 200)
                            }
                        })
                } else {
                    lib.serveError(env.res, 404, 'No _id')
                }
                break
            case 'DELETE':
                if (_id) {
                    collection.findOneAndDelete({_id: _id}, function (err, result) {
                        if (err || !result.value) {
                            lib.serveError(env.res, 404, 'User not found')
                        } else {
                            lib.serveJson(env.res, result.value, 200)
                        }
                    })
                } else {
                    lib.serveError(env.res, 400, 'No _id')
                }
                break
            default:
                lib.serveError(env.res, 405, 'Method not implemented')
        }
    }
}