let http = require('http');
let node_static = require('node-static')
let url = require('url')
let mongodb = require('mongodb')

let httpServer = http.createServer()
let fileServer = new node_static.Server('./public')

let userCollection = null
let historyCollection = null

let serveJson = function (res, obj, code = 200) {
    res.writeHead(200, {"Content-Type": 'application/json; charset=utf-8'})
    res.write(JSON.stringify(obj))
    res.end()
}

let serveError = function (res, code, message = 'Error occured') {
    serveJson(res, { error: message }, code)
}

httpServer.on('request', function(req, res) {
    let payload = ''
    req.on('data', function(data) {
        payload += data
    }).on('end', function() {
        let parsedPayload = {}
        try {
            parsedPayload = JSON.parse(payload)
        } catch(ex) {}
        console.log(req.method, req.url, parsedPayload)
        let parsedUrl = url.parse(req.url, true)

        let _id = null
        let _idStr = parsedUrl.query._id
        if(_idStr) {
            try {
                _id = mongodb.ObjectId(_idStr)
            } catch (ex) {
                serveError(res, 406, '_id broken')
                return
            }
        }
        switch(parsedUrl.pathname) {
            case '/user':
                switch(req.method) {
                    case 'GET':
                        if(_id) {
                            userCollection.findOne({_id : _id}, function (err, result) {
                                if(err || !result) {
                                    serveError(res, 404, 'User not found')
                                }
                                else {
                                    serveJson(res, result)
                                }
                            })
                        }
                        else {
                            userCollection.find({}).toArray(function(err, result) {
                                serveJson(res, result)
                            })
                        }
                        break
                    case 'POST':
                        userCollection.insertOne(parsedPayload, function (err, result) {
                            if(err || !result.ops || !result.ops[0]) {
                                serveError(res, 400, 'Insert failed')
                            } else {
                                serveJson(res, result.ops[0])
                            }
                        })
                        break
                    case 'PUT':
                        if(_id) {
                            delete parsedPayload._id
                            userCollection.findOneAndUpdate({_id: _id},
                                                        {$set: parsedPayload},
                                                        {returnOriginal: false},
                                                        function (err, result) {
                                if (err || !result.value) {
                                    serveError(res, 404, 'User not found')
                                }
                                else
                                {
                                    serveJson(res, result.value, 200)
                                }
                            })
                        } else {
                            serveError(res, 404, 'No _id')
                        }
                        break
                    case 'DELETE':
                        if(_id) {
                            userCollection.findOneAndDelete({_id: _id}, function (err, result) {
                                if(err || !result.value) {
                                    serveError(res, 404, 'User not found')
                                }
                                else {
                                    serveJson(res, result.value, 200)
                                }
                            })
                        } else {
                            serveError(res, 400, 'No _id')
                        }
                        break
                    default:
                        serveError(res, 405, 'Method not implemented')
                }
                break
            case '/transfer':
                let recipient = null
                try {
                    recipient=mongodb.ObjectId(parsedUrl.query.recipient)
                } catch (e) {
                    serveError(res, 406, 'Recipient _id broken')
                    return
                }
                switch(req.method) {
                    case 'GET':
                        historyCollection.find({recipient:recipient}).toArray(function (err,result) {
                            if(err || !result) {
                                serveError(res, 404, 'History not found')
                            }
                            else {
                                serveJson(res, result)
                            }
                        })
                        break
                    case 'POST':
                        userCollection.findOne({_id: recipient }, function (err, result) {
                            if(err || !result) {
                                serveError(res, 404, 'User not found')
                            }
                            else {
                                let oldAmount = (isNaN(result.amount)?0:result.amount)
                                let delta = (isNaN(parsedPayload.delta)?0:(parsedPayload.delta))
                                let newAmount = oldAmount + delta
                                userCollection.findOneAndUpdate({_id: recipient},{$set: {amount : newAmount}},{returnOriginal: false},function (err, result) {
                                    if (err || !result.value) {
                                        serveError(res, 404, 'User not found')
                                    }
                                    else
                                    {
                                        let updatedUser = result.value
                                        historyCollection.insertOne({
                                            date: new Date().getTime(),
                                            recipient: recipient,
                                            amount_before: oldAmount,
                                            delta: delta,
                                            amount_after: newAmount
                                        }, function () {
                                                serveJson(res, updatedUser)
                                        })
                                    }
                                })
                            }
                        })
                        break
                    default:
                        serveError(res, 405, 'Method not implemented')
                }
                break
            default:
                fileServer.serve(req, res)
        }
    })
})

mongodb.MongoClient.connect('mongodb://localhost', {useUnifiedTopology: true}, function (err, connection) {
    if(err) {
        console.error('Connection to mongodb failed')
        process.exit(0)
    }

    let db = connection.db('WebDatabase')
    userCollection = db.collection('users')
    historyCollection = db.collection('history')

    console.log('Database connected, starting http server')

    httpServer.listen(8000)
})