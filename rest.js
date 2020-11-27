let db = require('./db')
let collectionRest = require('./collectionRest')
let transfer = require('./transfer')
let login = require('./login')

module.exports = {

    handle: function (env) {
        switch (env.parsedUrl.pathname) {
            case '/person':
                collectionRest.handle(env, db.userCollection)
                break
            case '/group':
                collectionRest.handle(env, db.groupCollection)
                break
            case '/transfer':
                transfer.perform(env)
                break
            case '/login':
                login.handle (env)
                break;
            default:
                return false
        }
        return true
    }
}