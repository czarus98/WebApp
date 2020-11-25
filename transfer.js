let mongodb = require('mongodb')
let lib = require('./lib')

module.exports = {

    perform: function (historyCollection, userCollection, req, res, _idStr, parsedPayload, parsedUrl) {
        let _id=parsedUrl.query._id

        try {
            _id = mongodb.ObjectId(_idStr)
        } catch (ex) {
            lib.serveError(res, 406, '_id broken')
            return
        }

        let recipient = null
        try {
            recipient = mongodb.ObjectId(parsedUrl.query.recipient)
        } catch (e) {
            lib.serveError(res, 406, 'Recipient _id broken')
            return
        }
        switch (req.method) {
            case 'GET':
                historyCollection.find({recipient: recipient}).toArray(function (err, result) {
                    if (err || !result) {
                        lib.serveError(res, 404, 'History not found')
                    } else {
                        lib.serveJson(res, result)
                    }
                })
                break
            case 'POST':
                userCollection.findOne({_id: recipient}, function (err, result) {
                    if (err || !result) {
                        lib.serveError(res, 404, 'User not found')
                    } else {
                        let oldAmount = (isNaN(result.amount) ? 0 : result.amount)
                        let delta = (isNaN(parsedPayload.delta) ? 0 : (parsedPayload.delta))
                        let newAmount = oldAmount + delta
                        userCollection.findOneAndUpdate({_id: recipient}, {$set: {amount: newAmount}}, {returnOriginal: false}, function (err, result) {
                            if (err || !result.value) {
                                lib.serveError(res, 404, 'User not found')
                            } else {
                                let updatedUser = result.value
                                historyCollection.insertOne({
                                    date: new Date().getTime(),
                                    recipient: recipient,
                                    amount_before: oldAmount,
                                    delta: delta,
                                    amount_after: newAmount
                                }, function () {
                                    lib.serveJson(res, updatedUser)
                                })
                            }
                        })
                    }
                })
                break
            default:
                lib.serveError(res, 405, 'Method not implemented')
        }
    }
}