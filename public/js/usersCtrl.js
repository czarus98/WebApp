app = angular.module('WebApp')

app.controller('UsersCtrl', ['$http', 'common', 'routes', function ($http, common, routes) {
    let ctrl = this

    ctrl.isVisible = function () {
        let route = routes.find(function (element) {
            return element.route === '/users'
        })
        return route && route.roles.includes(common.sessionData.role)
    }
    if (!ctrl.isVisible()) {
        return
    }

    ctrl.users = []
    ctrl.history = []
    ctrl.selected = -1
    ctrl.limit = 5
    ctrl.skip = 0
    ctrl.filter = ''

    ctrl.newUser = {
        firstName: '',
        lastName: '',
        email: '',
        year: 1970,
        role: 2
    }

    let refreshUsers = function () {
        $http.get('/user').then(
            function(res) {
                ctrl.users = res.data
            },
            function(err) {

            }
        )
    }

    ctrl.nextPage = function () {
        ctrl.skip += ctrl.limit
        ctrl.filterUsers()
    }

    ctrl.previousPage = function () {
        ctrl.skip -= ctrl.limit
        ctrl.filterUsers()
    }

    ctrl.filterUsers = function () {
        if(ctrl.skip<0) {
            ctrl.skip=0
        }
        if(ctrl.limit <= 0) {
            ctrl.limit = 1
        }
        $http.get('/user?skip=' + ctrl.skip + '&limit=' + ctrl.limit + '&filter=' + ctrl.filter).then(
            function(res) {
                ctrl.users = res.data
            },
            function(err) {

            }
        )
    }

    ctrl.filterUsers()
    refreshUsers()

    let refreshUser = function () {
        $http.get('/user?_id=' + ctrl.users[ctrl.selected]._id).then(
            function (res) {
                ctrl.user = res.data
            },
            function (err) {
            }
        )
    }

    ctrl.insertNewData = function () {
        $http.post('/user', ctrl.newUser).then(
            function (res) {
                refreshUsers()
                ctrl.filterUsers()
                common.alert('alert-success', 'Użytkownik dodany');
            },
            function (err) {
                common.alert('alert-danger', 'Nie udało się dodać użytkownika');
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
                ctrl.filterUsers()
                common.alert('alert-success', 'Dane osoby zostały zmienione');
            },
            function (err) {
                common.alert('alert-danger', 'Nie udało sie zmienic danych')
            }
        )
    }

    ctrl.deleteData = function () {
        $http.delete('/user?_id=' + ctrl.users[ctrl.selected]._id).then(
            function (res) {
                refreshUsers()
                ctrl.filterUsers()
                common.alert('alert-success', 'Osoba została usunięta');
            },
            function (err) {
                common.alert('alert-danger', 'Nie udało sie usunac osoby')
            }
        )
    }
}])