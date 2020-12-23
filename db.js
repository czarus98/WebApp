let mongodb = require('mongodb')

let config = require('./config')

let db = module.exports = {

    userCollection: null,
    historyCollection: null,
    groupCollection: null,
    credentialsCollection: null,

    init: function (nextTick) {
        mongodb.MongoClient.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, connection) {
            if (err) {
                console.error('Connection to database failed')
                process.exit(0)
            }
            let conn = connection.db(config.dbName)
            db.userCollection = conn.collection('users')
            db.historyCollection = conn.collection('history')
            db.groupCollection = conn.collection('groups')
            db.credentialCollection = conn.collection('credentials')
            nextTick()
        })
    }


}
