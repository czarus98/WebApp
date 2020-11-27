let http = require('http');
let node_static = require('node-static')
let url = require('url')

let config = require('./config')
let db = require('./db')
let rest = require('./rest')

let httpServer = http.createServer()
let fileServer = new node_static.Server(config.frontendDir)

httpServer.on('request', function (req, res) {

    let env = {
        req: req,
        res: res,
        parsedUrl: {},
        parsedPayload: {},
    }

    let payload = ''
    req.on('data', function (data) {
        payload += data
    }).on('end', function () {

        try {
            env.parsedPayload = JSON.parse(payload)
        } catch (ex) {
        }
        try {
            env.parsedUrl = url.parse(req.url, true)
        } catch (ex) {
        }
        console.log(req.method, env.parsedUrl.pathname, JSON.stringify(env.parsedUrl.query), JSON.stringify(env.parsedPayload))

        if (!rest.handle(env)) {
            fileServer.serve(req, res)
        }

    })
})

db.init(function () {
    console.log('Database connected, starting http server')
    httpServer.listen(config.port)
})