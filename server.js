let http = require('http');
let node_static = require('node-static')
let url = require('url')

let httpServer = http.createServer()
let fileServer = new node_static.Server('./public')

let persons = [{
        firstName: 'Czarek',
        lastName: 'Wojcik',
        amount: 0.0,
        year: 1998
    },
    {
        firstName: 'Jan',
        lastName: 'Kowalski',
        amount: 500.0,
        year: 1985
    },
    {
        firstName: 'Wojciech',
        lastName: 'Nowak',
        amount: 10.0,
        year: 1990
    }]

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
        let index = parseInt(parsedUrl.query.index)
        let person = null
        if(index >= 0 || index < persons.length) {
            person = persons[ index ]
        }
        switch(parsedUrl.pathname) {
            case '/person':
                switch(req.method) {
                    case 'GET':
                        if(person)
                            serveJson(res, person)
                        else
                            serveJson(res, persons)
                        break
                    case 'POST':
                        person = {}
                        person = Object.assign(person, parsedPayload)
                        persons.push(person)
                        serveJson(res, person)
                        break
                    case 'PUT':
                        Object.assign(person, parsedPayload)
                        serveJson(res, person)
                        break
                    case 'DELETE':
                        if(person) {
                            let deleted = {}
                            Object.assign(deleted, person)
                            persons.splice(index, 1)
                            serveJson(res, deleted)
                        } else {
                            serveError(res, 400)
                        }
                        break
                    default:
                        serveError(res, 405)
                }
                break
            case '/transfer':
                switch(req.method) {
                    case 'GET':
                        if(person) {
                            serveJson(res.history.filter(function (el) {return el.person_index == index}))
                        } else {
                            serveJson(res, history)
                        }
                        serveJson(res, history)
                        break
                    case 'POST':
                        if(!person || isNaN(parsedPayload.delta)) {
                            serveError(res, 400)
                        } else {
                            let story= {
                                date: new Date().getTime(),
                                person_index: index,
                                amount_before: person.amount,
                                delta: parsedPayload.delta
                            }
                            person.amount += parsedPayload.delta
                            console.log(story)
                            history.push(story)
                            serveJson(res, person)
                        }
                        break
                    default:
                        serveError(res, 405)
                }
            default:
                fileServer.serve(req, res)
        }
    })
})

httpServer.listen(8000)