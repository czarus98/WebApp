app = angular.module('WebApp')

app.controller('TransfersCtrl', ['$http', function ($http) {
    let ctrl = this

    ctrl.users = []
    ctrl.history = []
    ctrl.selected = -1

    ctrl.transfer = {
        delta: 0
    }

    let refreshUsers = function () {
        $http.get('/user').then(
            function (res) {
                ctrl.users = res.data
            },
            function (err) {
            }
        )
    }

    refreshUsers();

    let refreshHistory = function () {
        if (ctrl.selected < 0) {
            ctrl.history = []
        } else {
            $http.get('/transfer?recipient=' + ctrl.users[ctrl.selected]._id).then(
                function (res) {
                    ctrl.history = res.data
                },
                function (err) {
                }
            )
        }
    }

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

    ctrl.select = function (index) {
        ctrl.selected = index
        refreshHistory()
    }

    ctrl.formatDate = function (stamp) {
        return new Date(stamp).toLocaleDateString();
    }
}])