let bcrypt = require('bcrypt');

let lib = module.exports = {

    serveJson: function (res, obj, code = 200) {
        res.writeHead(code, {"Content-Type": 'application/json'})
        let output = JSON.stringify(obj)
        res.write(output)
        console.log(code, output)
        res.end()
    },

    serveError: function (res, code, message = 'Error occured') {
        lib.serveJson(res, {error: message}, code)
    }
}
