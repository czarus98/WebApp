let http = require('http');
let node_static = require('node-static')
let url = require('url')
let mongodb = require('mongodb')

let httpServer = http.createServer()
let fileServer = new node_static.Server('./public')
let collectionRest = require('./collectionRest');
let lib = require('./lib')
let transfer = require('./transfer')

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
        let _id=parsedUrl.query._id

        switch (parsedUrl.pathname) {
            case '/user':
                collectionRest.handle(userCollection, req, res, _id, parsedPayload);
                break
            case '/group':
                collectionRest.handle(groupCollection, req, res, _id, parsedPayload);
                break
            case '/transfer':
                transfer.perform(historyCollection, userCollection, req, res, _id, parsedPayload, parsedUrl);
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