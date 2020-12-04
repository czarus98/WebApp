app = angular.module('WebApp')

app.controller('HomeCtrl', ['$http', 'common', function ($http, common) {
    let ctrl = this

    ctrl.loggedUser = common.sessionData
    ctrl.credentials = {
        login: '',
        password: ''
    }

    ctrl.doLogin = function () {
        $http.post('/login', ctrl.credentials).then(
            function (res) {
                common.rebuildMenu()
            },
            function (err) {

            }
        )
    }

    ctrl.doLogout = function () {
        $http.delete('/login', ctrl.credentials).then(
            function (res) {
                common.rebuildMenu()
            },
            function (err) {

            }
        )
    }
}])