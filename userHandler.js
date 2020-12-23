let db = require('./db')
let mongodb = require('mongodb')
let lib = require('./lib')

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
            case 'GET':
                if (_id) {
                    if (env.parsedUrl.path === '/user?_id=' + _id) {
                        {
                            db.userCollection.findOne({_id: _id}, function (err, result) {
                                if (err || !result) {
                                    lib.serveError(env.res, 404, 'User not found')
                                } else {
                                    lib.serveJson(env.res, result)
                                }
                            })
                        }
                    }
                } else {
                    let limit = parseInt(env.parsedUrl.query.limit)
                    if (isNaN(limit) || limit <= 0) {
                        lib.serveError(env.res, 400, 'wrong limit number')
                        return
                    }
                    let filter = env.parsedUrl.query.filter
                    let value_match = new RegExp(filter)
                    db.userCollection.aggregate([
                        {$match: {$or: [{firstName: value_match}, {lastName: value_match}]}},
                        {$limit: limit}
                    ]).toArray(function (err, result) {
                        if (err)
                            lib.serveError(env.res, 400, 'Fail to get users');
                        else {
                            lib.serveJson(env.res, result);
                        }
                    })
                }
                break
            case 'DELETE':
                if (_id) {
                    db.userCollection.findOneAndDelete({_id: _id}, function (err, result) {
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
            case 'POST':
                db.userCollection.insertOne(env.parsedPayload, function (err, result) {
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
                    db.userCollection.findOneAndUpdate({_id: _id},
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
        }
    }
}

