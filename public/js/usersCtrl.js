app = angular.module('WebApp')

app.controller('UsersCtrl', ['$http', 'common', 'routes', function ($http, common, routes) {
    let ctrl = this

    ctrl.isVisible = function () {
        let route = routes.find(function (element) {
            return element.route === '/users'
        })
        return route && common.sessionData.role in routes[route].roles
    }
    if (!ctrl.isVisible()) {
        return
    }

    ctrl.users = []
    ctrl.history = []
    ctrl.selected = -1

    ctrl.newUser = {
        firstName: '',
        lastName: '',
        year: 1970
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

    let refreshUser = function () {
        $http.get('/user?_id=' + ctrl.users[ctrl.selected]._id).then(
            function (res) {
                ctrl.user = res.data
            },
            function (err) {
            }
        )
    }

    refreshUsers();

    ctrl.insertNewData = function () {
        $http.post('/user', ctrl.newUser).then(
            function (res) {
                refreshUsers()
            },
            function (err) {
            }
        )
    }

    ctrl.select = function (index) {
        ctrl.selected = index
        refreshUser()
    }

    ctrl.updateData = function () {
        $http.put('/user?_id=' + ctrl.users[ctrl.selected]._id, ctrl.user).then(
            function (res) {
                refreshUsers()
            },
            function (err) {
            }
        )
    }

    ctrl.deleteData = function () {
        $http.delete('/user?_id=' + ctrl.users[ctrl.selected]._id).then(
            function (res) {
                refreshUsers()
            },
            function (err) {
            }
        )
    }


}])