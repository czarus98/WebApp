app = angular.module('WebApp')

app.controller('HomeCtrl', [ '$http', function ($http) {
    let ctrl = this

    ctrl.credentials = {
        login: '',
        password: ''
    }

    ctrl.doLogin = function () {
        $http.post('/login', ctrl.credentials).then(
            function (res) {
                ctrl.login = res.data.login
            },
            function (err) {

            }
        )
    }

    ctrl.doLogout = function () {
        $http.delete('/login', ctrl.credentials).then(
            function (res) {
                ctrl.login = res.data.login
            },
            function (err) {

            }
        )
    }

    $http.get('/login').then(
        function (res) {
            ctrl.login = res.data.login
        },
        function (err){

        }
    )
}])