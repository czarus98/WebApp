let app = angular.module('WebApp', [])

app.controller('Ctrl', ['$http', function ($http) {
    let ctrl = this

    ctrl.newPerson = {
        firstName: '',
        lastName: '',
        year: 1970
    }

    $http.get('/get').then(
        function (res) {
            ctrl.person = res.data
        },
        function (err) {
        }
    )

    ctrl.dataChanged = function () {
        $http.get('/set?firstName=' + ctrl.person.firstName + '&lastName=' + ctrl.person.lastName + '&year=' + ctrl.person.year).then(
            function (res) {
            },
            function (err) {
            }
        )
    }

    ctrl.sendNewData = function () {
        $http.get('/set?firstName=' + ctrl.newPerson.firstName + '&lastName=' + ctrl.newPerson.lastName + '&year=' + ctrl.newPerson.year).then(
            function (res) {
                ctrl.person = res.data
            },
            function (err) {
            }
        )
    }
}])