let lib = require('./lib')

module.exports = {

    handle: function (userCollection, req, res, _id, parsedPayload) {
        switch (req.method) {
            case 'GET':
                if (_id) {
                    userCollection.findOne({_id: _id}, function (err, result) {
                        if (err || !result) {
                            lib.serveError(res, 404, 'User not found')
                        } else {
                            lib.serveJson(res, result)
                        }
                    })
                } else {
                    userCollection.find({}).toArray(function (err, result) {
                        lib.serveJson(res, result)
                    })
                }
                break
            case 'POST':
                userCollection.insertOne(parsedPayload, function (err, result) {
                    if (err || !result.ops || !result.ops[0]) {
                        lib.serveError(res, 400, 'Insert failed')
                    } else {
                        lib.serveJson(res, result.ops[0])
                    }
                })
                break
            case 'PUT':
                if (_id) {
                    delete parsedPayload._id
                    userCollection.findOneAndUpdate({_id: _id},
                        {$set: parsedPayload},
                        {returnOriginal: false},
                        function (err, result) {
                            if (err || !result.value) {
                                lib.serveError(res, 404, 'User not found')
                            } else {
                                lib.serveJson(res, result.value, 200)
                            }
                        })
                } else {
                    lib.serveError(res, 404, 'No _id')
                }
                break
            case 'DELETE':
                if (_id) {
                    userCollection.findOneAndDelete({_id: _id}, function (err, result) {
                        if (err || !result.value) {
                            lib.serveError(res, 404, 'User not found')
                        } else {
                            lib.serveJson(res, result.value, 200)
                        }
                    })
                } else {
                    lib.serveError(res, 400, 'No _id')
                }
                break
            default:
                lib.serveError(res, 405, 'Method not implemented')
        }
    }
}