app = angular.module('WebApp')

app.controller('TransfersCtrl', ['$http', 'common', function ($http, common) {
    let ctrl = this
    ctrl.history = []

    ctrl.formatDate = common.formatDate

    ctrl.transfer = {
        delta: 0
    }
    ctrl.amount = 0

    ctrl.recipients = [{id: 1, name: 'ala'}, {id: 2, name: 'ma'}, {id: 4, name: 'kota'}]
    ctrl.recipient = ctrl.recipients[0]

    let refreshHistory = function () {
        $http.get('/transfer').then(
            function (res) {
                ctrl.history = res.data
                $http.delete('/transfer').then(
                    function (res) {
                        ctrl.amount = res.data.amount
                    },
                    function (err) {

                    }
                )
            },
            function (err) {
            })
    }

    refreshHistory()

    ctrl.doTransfer = function () {
        $http.post('/transfer?recipient=' + ctrl.recipient._id, ctrl.transfer).then(
            function (res) {
                refreshHistory()
            },
            function (err) {
            }
        )
    }

    $http.get('/userList').then(
        function (res) {
            ctrl.recipients = res.data
            ctrl.recipient = ctrl.recipients[0]
        },
        function (err) {
            ctrl.recipients = []
            ctrl.recipient = null
        })
}])