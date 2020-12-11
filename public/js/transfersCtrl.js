app = angular.module('WebApp')

app.controller('TransfersCtrl', ['$http', 'common', function ($http, common) {
    let ctrl = this
    ctrl.history = []

    ctrl.formatDate = common.formatDate

    ctrl.transfer = {
        delta: 0
    }

    let refreshHistory = function () {
        $http.get('/transfer').then(
            function (res) {
                ctrl.history = res.data
            },
            function (err) {
            })
    }

    refreshHistory()

    ctrl.doTransfer = function () {
        $http.post('/transfer?recipient=' + ctrl.users[ctrl.selected]._id, ctrl.transfer).then(
            function (res) {
                ctrl.users[ctrl.selected] = res.data
                refreshHistory()
            },
            function (err) {
            }
        )
    }
}])