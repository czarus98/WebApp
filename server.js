let http = require('http');
let node_static = require('node-static')
let url = require('url')
let cookies = require('cookies')
let uuid = require('uuid')

let config = require('./config')
let db = require('./db')
let rest = require('./rest')

let httpServer = http.createServer()
let fileServer = new node_static.Server(config.frontendDir)

let sessions = {}

httpServer.on('request', function (req, res) {

    let appCookies = new cookies(req, res)
    let session = appCookies.get('session')
    let now = Date.now()
    if (!session || !sessions[session]) {
        session = uuid.v4()
        sessions[session] = {from: req.connection.remoteAddress, created: now, touched: now}
    } else {
        sessions[session].touched = now
    }
    appCookies.set('session', session, {httpOnly: false})

    let env = {
        req: req,
        res: res,
        parsedUrl: {},
        parsedPayload: {},
        session: session,
        sessionData: sessions[session]
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
        console.log(env.session, req.method, env.parsedUrl.pathname, JSON.stringify(env.parsedUrl.query), JSON.stringify(env.parsedPayload))

        if (!rest.handle(env)) {
            fileServer.serve(req, res)
        }

    })
})

db.init(function () {
    console.log('Database connected, starting http server')
    httpServer.listen(config.port)
})