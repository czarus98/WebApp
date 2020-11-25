let http = require('http');
let node_static = require('node-static')
let url = require('url')
let mongodb = require('mongodb')

let httpServer = http.createServer()
let fileServer = new node_static.Server('./public')
let collectionRest = require('./collectionRest');
let lib = require('./lib')

let userCollection = null
let historyCollection = null
let groupCollection = null

httpServer.on('request', function (req, res) {
    let payload = ''
    req.on('data', function (data) {
        payload += data
    }).on('end', function () {
        let parsedPayload = {}
        try {
            parsedPayload = JSON.parse(payload)
        } catch (ex) {
        }
        console.log(req.method, req.url, parsedPayload)
        let parsedUrl = url.parse(req.url, true)

        let _id = null
        let _idStr = parsedUrl.query._id
        if (_idStr) {
            try {
                _id = mongodb.ObjectId(_idStr)
            } catch (ex) {
                lib.serveError(res, 406, '_id broken')
                return
            }
        }
        switch (parsedUrl.pathname) {
            case '/user':
                collectionRest.handle(userCollection, req, res, _id, parsedPayload);
                break
            case '/group':
                collectionRest.handle(groupCollection, req, res, _id, parsedPayload);
                break
            case '/transfer':
                let recipient = null
                try {
                    recipient = mongodb.ObjectId(parsedUrl.query.recipient)
                } catch (e) {
                    lib.serveError(res, 406, 'Recipient _id broken')
                    return
                }
                switch (req.method) {
                    case 'GET':
                        historyCollection.find({recipient: recipient}).toArray(function (err, result) {
                            if (err || !result) {
                                lib.serveError(res, 404, 'History not found')
                            } else {
                                lib.serveJson(res, result)
                            }
                        })
                        break
                    case 'POST':
                        userCollection.findOne({_id: recipient}, function (err, result) {
                            if (err || !result) {
                                lib.serveError(res, 404, 'User not found')
                            } else {
                                let oldAmount = (isNaN(result.amount) ? 0 : result.amount)
                                let delta = (isNaN(parsedPayload.delta) ? 0 : (parsedPayload.delta))
                                let newAmount = oldAmount + delta
                                userCollection.findOneAndUpdate({_id: recipient}, {$set: {amount: newAmount}}, {returnOriginal: false}, function (err, result) {
                                    if (err || !result.value) {
                                        lib.serveError(res, 404, 'User not found')
                                    } else {
                                        let updatedUser = result.value
                                        historyCollection.insertOne({
                                            date: new Date().getTime(),
                                            recipient: recipient,
                                            amount_before: oldAmount,
                                            delta: delta,
                                            amount_after: newAmount
                                        }, function () {
                                            lib.serveJson(res, updatedUser)
                                        })
                                    }
                                })
                            }
                        })
                        break
                    default:
                        lib.serveError(res, 405, 'Method not implemented')
                }
                break
            default:
                fileServer.serve(req, res)
        }
    })
})

mongodb.MongoClient.connect('mongodb://localhost', {useUnifiedTopology: true}, function (err, connection) {
    if (err) {
        console.error('Connection to mongodb failed')
        process.exit(0)
    }

    let db = connection.db('WebDatabase')
    userCollection = db.collection('users')
    historyCollection = db.collection('history')
    groupCollection = db.collection('groups')

    console.log('Database connected, starting http server')

    httpServer.listen(8000)
})