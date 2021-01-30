let db = require('./db')
let collectionRest = require('./collectionRest')
let transfer = require('./transfer')
let login = require('./login')
let register = require('./register')
let lib = require('./lib')
let userHandler = require('./userHandler')
let passwordChange = require('./passwordChange')

module.exports = {
    handle: function (env) {
        switch (env.parsedUrl.pathname) {
            case '/user':
                if (env.sessionData.role === 1) {
                    userHandler.handle(env)
                } else {
                    lib.serveError(env.res, 403, 'Permission denied')
                }
                break
            case '/group':
                if (env.sessionData.role && env.sessionData.role === 1) {
                    collectionRest.handle(env, db.groupCollection)
                } else {
                    lib.serveError(env.res, 403, 'Permission denied')
                }
                break
            case '/userList':
                if (env.sessionData.role === 2 && env.req.method === 'GET') {
                    transfer.userList(env)
                } else {
                    lib.serveError(env.res, 403, 'Permission denied')
                }
                break
            case '/transfer':
                if (env.sessionData.role === 2) {
                    transfer.perform(env)
                } else {
                    lib.serveError(env.res, 403, 'permission denied')
                }
                break
            case '/login':
                login.handle(env)
                break
            case '/register':
                register.handle(env)
                break
            case '/passwordChange':
                passwordChange.handle(env)
                break
            default:
                return false
        }
        return true
    }
}