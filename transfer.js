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
                db.historyCollection.aggregate([
                    {
                        $match: {
                            $or: [
                                {sender: env.sessionData._id, delta: {$lt: 0}},
                                {recipient: env.sessionData._id, delta: {$gt: 0}}
                            ]
                        }
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'sender',
                            foreignField: '_id',
                            as: 'senderData'
                        }
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'recipient',
                            foreignField: '_id',
                            as: 'recipientData'
                        }
                    },
                    {$unwind: '$senderData'},
                    {$unwind: '$recipientData'},
                    {$addFields: {senderFirstName: '$senderData.firstName'}},
                    {$addFields: {senderLastName: '$senderData.lastName'}},
                    {$addFields: {recipientFirstName: '$recipientData.firstName'}},
                    {$addFields: {recipientLastName: '$recipientData.lastName'}},
                    {$project: {senderData: false, recipientData: false}}
                ]).toArray(function (err, result) {
                    if (err || !result) {
                        lib.serveError(env.res, 404, 'No Transfers')
                    } else {
                        lib.serveJson(env.res, result)
                    }
                })
                break
            case 'POST':
                db.userCollection.findOne({_id: env.sessionData._id}, function (err, senderData) {
                    if (err || !senderData) {
                        lib.serveError(env.res, 404, 'no sender')
                        return
                    }
                    let delta = isNaN(env.parsedPayload.delta) ? 0 : env.parsedPayload.delta
                    if (delta <= 0) {
                        lib.serveError(env.res, 400, 'delta should be positive')
                        return
                    }
                    if (senderData.amount < delta) {
                        lib.serveError(env.res, 400, 'not enough money')
                        return
                    }

                    senderData.amount -= delta

                    db.userCollection.findOneAndUpdate({_id: recipient}, {$inc: {amount: delta}},
                        {returnOriginal: false}, function (err, result) {
                            if (err || !result.value) {
                                lib.serveError(env.res, 400, 'no recipient')
                                return
                            }
                            let recipientData = result.value

                            db.userCollection.findOneAndUpdate({_id: senderData._id}, {$set: {amount: senderData.amount}})

                            let now = new Date().getTime()
                            db.historyCollection.insertOne({
                                date: now,
                                sender: senderData._id,
                                recipient: recipient,
                                delta: -delta,
                                amount_after: senderData.amount
                            })
                            db.historyCollection.insertOne({
                                date: now,
                                sender: senderData._id,
                                recipient: recipient,
                                delta: delta,
                                amount_after: recipientData.amount
                            })

                            lib.serveJson(env.res, senderData)
                        })
                })
                break
            case 'DELETE':
                db.userCollection.findOne({_id: env.sessionData._id}, function (err, senderData) {
                    if (err || !senderData) {
                        lib.serveError(env.res, 404, 'No sender')
                        return
                    }
                    lib.serveJson(env.res, {amount: senderData.amount})
                })
                break
            default:
                lib.serveError(env.res, 405, 'Method not implemented')
        }
    },
    userList: function (env) {
        db.userCollection.find({}).toArray(function (err, result) {
            lib.serveJson(env.res, result)
        })
    }
}