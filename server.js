
let http = require('http');
let node_static = require('node-static')
let url = require('url')

let httpServer = http.createServer()
let fileServer = new node_static.Server('./public')

let serveError = (res, code) => {
    res.writeHead(code, { "Content-Type": 'text/plain; charset=utf-8' })
    res.write('Error')
    res.end()
}

let person={
    firstName: 'Czarek',
    lastName: 'Wojcik',
    year: 1998
}

httpServer.on('request', function (req, res) {
        console.log(req.method, req.url)
        var parsed = url.parse(req.url, true)
        switch(parsed.pathname) {
            case '/get':
                res.writeHead(200, { "Content-Type": 'application/json; charset=utf-8' })
                res.write(JSON.stringify(person))
                res.end()
                break
            case '/set':
                person.firstName=parsed.query.firstName
                person.lastName=parsed.query.lastName
                person.year=parseInt(parsed.query.year)
                if(isNaN(person.year)) {
                    person.year=2000
                }
                res.writeHead(200, { "Content-Type": 'application/json; charset=utf-8' })
                res.write(JSON.stringify(person))
                res.end()
                break
            default:
                fileServer.serve(req, res)
        }
    }
)

httpServer.listen(8080)