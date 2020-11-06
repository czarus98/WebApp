let http = require('http');
let node_static = require('node-static')
let url = require('url')

let httpServer = http.createServer()
let fileServer = new node_static.Server('./public')
let person = {
    firstName: 'Czarek',
    lastName: 'Wojcik',
    amount: 0,
    year: 1998
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
                            res.writeHead(200, {"Content-Type": 'application/json; charset=utf-8'})
                            res.write(JSON.stringify(person))
                            res.end()
                            break
                        case 'PUT':
                            person.firstName = data.firstName
                            person.lastName = data.lastName
                            person.year = parseInt(data.year)
                            if (isNaN(person.year)) {
                                person.year = 2000
                            }
                            res.writeHead(200, {"Content-Type": 'application/json; charset=utf-8'})
                            res.write(JSON.stringify(person))
                            res.end()
                            break
                        case 'POST':
                            let delta = parseFloat(data.delta)
                            if(isNaN(delta))
                            {

                            } else {
                                person.amount += delta
                                res.writeHead(200, {"Content-Type": 'application/json; charset=utf-8'})
                                res.write(JSON.stringify(person))
                                res.end()
                            }
                            break
                        case 'DELETE':
                            person.amount=0
                            res.writeHead(200, {"Content-Type": 'application/json; charset=utf-8'})
                            res.write(JSON.stringify(person))
                            res.end()
                            break
                    }
                    break
                default:
                    fileServer.serve(req, res)
            }
        })
    }
)

httpServer.listen(8000)