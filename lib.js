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
    },


    cryptPassword: function (password, callback) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err)
                return callback(err);

            bcrypt.hash(password, salt, function (err, hash) {
                return callback(err, hash);
            })
        })
    },

    comparePassword: function (plainPass, hashword, callback) {
        bcrypt.compare(plainPass, hashword, function (err, isPasswordMatch) {
            return err == null ?
                callback(null, isPasswordMatch) :
                callback(err);
        });
    }
}
