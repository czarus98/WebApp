
let http = require('http');
let node_static = require('node-static')

let httpServer = http.createServer()
let fileServer = new node_static.Server('./public')

let serveError = (res, code) => {
    res.writeHead(code, { "Content-Type": 'text/plain; charset=utf-8' })
    res.write('Error')
    res.end()
}

httpServer.on('request', function (req, res) {
        console.log(req.method, req.url)
        if (/^\/rest/.test(req.url)) {
            serveError(res, 403)
        } else {
            fileServer.serve(req, res)
        }
    }
)

httpServer.listen(8080)