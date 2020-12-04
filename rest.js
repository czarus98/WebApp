let db = require('./db')
let collectionRest = require('./collectionRest')
let transfer = require('./transfer')
let login = require('./login')
let lib = require('./lib')

module.exports = {

    handle: function (env) {
        switch (env.parsedUrl.pathname) {
            case '/person':
                if(env.sessionData.role && env.sessionData.role < 4) {
                    collectionRest.handle(env, db.userCollection)
                } else {
                    lib.serveError(env.res, 403, 'Permission denied')
                }
                break
            case '/group':
                if(env.sessionData.role && env.sessionData.role === 1) {
                    collectionRest.handle(env, db.groupCollection)
                } else {
                    lib.serveError(env.res, 403, 'Permission denied')
                }
                break
            case '/transfer':
                transfer.perform(env)
                break
            case '/login':
                login.handle(env)
                break;
            default:
                return false
        }
        return true
    }
}