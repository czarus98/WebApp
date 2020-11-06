let http = require('http');
let node_static = require('node-static')
let url = require('url')

let httpServer = http.createServer()
let fileServer = new node_static.Server('./public')
let person = {
    firstName: 'Czarek',
    lastName: 'Wojcik',
    amount: 0.0,
    year: 1998
}

let serveJson = function (res, obj, code = 200) {
    res.writeHead(200, {"Content-Type": 'application/json; charset=utf-8'})
    res.write(JSON.stringify(obj))
    res.end()
}

let serveError = function (res, code) {
    serveJson(res, {error: 'Error occured'}, code)
}

httpServer.on('request', function (req, res) {
        let payload = '';
        req.on('data', function (data) {
            payload += data
        }).on('end', function () {
            let data = {};
            try {
                data = JSON.parse(payload);
            } catch (ex) {
            }
            let parsed = url.parse(req.url, true);
            switch (parsed.pathname) {
                case '/person':
                    switch (req.method) {
                        case 'GET':
                            serveJson(res, person)
                            break
                        case 'PUT':
                            Object.assign(person, data)
                            serveJson(res, person)
                            break
                        case 'POST':
                            let delta = parseFloat(data.delta)
                            if (isNaN(delta)) {
                                serveError(res, 400);
                            } else {
                                person.amount += delta
                                serveJson(res, person)
                            }
                            break
                        case 'DELETE':
                            person.amount = 0
                            serveJson(res, person)
                            break
                        default:
                            serveError(res, 405);
                    }
                    break
                default:
                    fileServer.serve(req, res)
            }
        })
    }
)

httpServer.listen(8000)