let app = angular.module('WebApp', [])

app.controller('Ctrl', ['$http', function ($http) {
    let ctrl = this

    ctrl.newPerson = {
        firstName: '',
        lastName: '',
        year: 1970,
    }

    ctrl.transfer = {
        delta: 0
    }

    $http.get('/person').then(
        function (res) {
            ctrl.person = res.data
        },
        function (err) {
        }
    )

    ctrl.dataChanged = function () {
        $http.put('/person', ctrl.person).then(
            function (res) {
            },
            function (err) {
            }
        )
    }

    ctrl.sendNewData = function () {
        $http.put('/person', ctrl.newPerson).then(
            function (res) {
                ctrl.person = res.data
            },
            function (err) {
            }
        )
    }

    ctrl.doTransfer = function () {
        $http.post('/person', ctrl.transfer).then(
            function (res) {
                ctrl.person = res.data
            },
            function (err) {
            }
        )
    }

    ctrl.deleteAmount = function () {
        $http.delete('/person', ctrl.transfer).then(
            function (res) {
                ctrl.person.amount=0
            },
            function (err) {
            }
        )
    }
}])