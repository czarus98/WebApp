let lib = require('./lib')

module.exports = {
    handle: function (env) {
        switch(env.req.method) {
            case 'GET':
                break
            case 'POST':
                env.sessionData.login = env.parsedPayload.login
                break
            case 'DELETE':
                delete env.sessionData.login
                break
            default:
                lib.serveError(env.res, 405, 'Method not implemented')
                return
        }
        lib.serveJson(env.res, { session: env.session, login: env.sessionData.login } )
    }
}