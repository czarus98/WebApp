let http = require('http');
let node_static = require('node-static')
let url = require('url')
let mongodb = require('mongodb')

let httpServer = http.createServer()
let fileServer = new node_static.Server('./public')

let userCollection = null

let history = []

let serveJson = function (res, obj, code = 200) {
    res.writeHead(200, {"Content-Type": 'application/json; charset=utf-8'})
    res.write(JSON.stringify(obj))
    res.end()
}

let serveError = function (res, code) {
    serveJson(res, {error: 'Error occured'}, code)
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
                serveError(res, 400)
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
                                    serveError(res, 404)
                                }
                                else {
                                    serveJson(res, result)
                                }
                            })
                        }
                        else {
                            userCollection.find({}, function (err, result) {
                                serveJson(res, result)
                            })
                        }
                        break
                    case 'POST':
                        userCollection.insertOne(parsedPayload, function (err, result) {
                            if(err || !result.ops || !result.ops[0]) {
                                serveError(res, 400)
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
                                    serveError(res, 404)
                                }
                                else
                                {
                                    serveJson(res, result.value, 200)
                                }
                            })
                        } else {
                            serveError(res, 404)
                        }
                        break
                    case 'DELETE':
                        if(_id) {
                            userCollection.findOneAndDelete({_id: _id}, function (err, result) {
                                if(err || !result.value) {
                                    serveError(res, 404)
                                }
                                else {
                                    serveJson(res, result.value, 200)
                                }
                            })
                        } else {
                            serveError(res, 404)
                        }
                        break
                    default:
                        serveError(res, 405)
                }
                break
            case '/transfer':
                switch(req.method) {
                    case 'GET':
                    //     if(user) {
                    //         serveJson(res, history.filter(function (el) {return el.user_index == index}))
                    //     } else {
                    //         serveJson(res, history)
                    //     }
                    //     break
                    // case 'POST':
                    //     if(!user || isNaN(parsedPayload.delta)) {
                    //         serveError(res, 400)
                    //     } else {
                    //         let story= {
                    //             date: new Date().toISOString().slice(0,19),
                    //             user_index: index,
                    //             amount_before: user.amount,
                    //             delta: parsedPayload.delta
                    //         }
                    //         user.amount += parsedPayload.delta
                    //         history.push(story)
                    //         serveJson(res, user)
                    //     }
                    //     break
                    // default:
                    //     serveError(res, 405)
                }
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
    // userCollection.find({}, function (err, result) {
    //     users = result
    // })

    console.log('Database connected, starting http server')

    httpServer.listen(8000)
})