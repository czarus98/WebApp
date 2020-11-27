let mongodb = require('mongodb')
let lib = require('./lib')
let db = require('./db')

module.exports = {

    perform: function (env) {

        let recipient = null
        try {
            recipient = mongodb.ObjectId(env.parsedUrl.query.recipient)
        } catch (e) {
            lib.serveError(env.res, 406, 'Recipient _id broken')
            return
        }

        switch (env.req.method) {
            case 'GET':
                db.historyCollection.find({recipient: recipient}).toArray(function (err, result) {
                    if (err || !result) {
                        lib.serveError(env.res, 404, 'History not found')
                    } else {
                        lib.serveJson(env.res, result)
                    }
                })
                break
            case 'POST':
                db.userCollection.findOne({_id: recipient}, function (err, result) {
                    if (err || !result) {
                        lib.serveError(env.res, 404, 'User not found')
                    } else {
                        let oldAmount = (isNaN(result.amount) ? 0 : result.amount)
                        let delta = (isNaN(env.parsedPayload.delta) ? 0 : (env.parsedPayload.delta))
                        let newAmount = oldAmount + delta
                        db.userCollection.findOneAndUpdate({_id: recipient}, {$set: {amount: newAmount}}, {returnOriginal: false}, function (err, result) {
                            if (err || !result.value) {
                                lib.serveError(env.res, 404, 'User not found')
                            } else {
                                let updatedUser = result.value
                                db.historyCollection.insertOne({
                                    date: new Date().getTime(),
                                    recipient: recipient,
                                    amount_before: oldAmount,
                                    delta: delta,
                                    amount_after: newAmount
                                }, function () {
                                    lib.serveJson(env.res, updatedUser)
                                })
                            }
                        })
                    }
                })
                break
            default:
                lib.serveError(env.res, 405, 'Method not implemented')
        }
    }
}