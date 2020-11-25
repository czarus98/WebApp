let lib = module.exports = {

    serveJson: function (res, obj, code = 200) {
        res.writeHead(200, {"Content-Type": 'application/json; charset=utf-8'})
        res.write(JSON.stringify(obj))
        res.end()
    },

    serveError: function (res, code, message = 'Error occured') {
        lib.serveJson(res, {error: message}, code)
    }
}