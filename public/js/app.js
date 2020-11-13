let app = angular.module('WebApp', [])

app.controller('Ctrl', ['$http', function ($http) {
    let ctrl = this

    ctrl.users = []

    ctrl.transfer = {
        delta: 0
    }

    ctrl.history = []

    $http.get('/user').then(
        function (res) {
            ctrl.users = res.data
        },
        function (err) {
        }
    )

    ctrl.insertNewData = function() {
        $http.post('/user', ctrl.newUser).then(
            function(res) {
                refreshUsers()
            },
            function(err) {}
        )
    }

    ctrl.getTransfer = function () {
        $http.get('/transfer?index=' + ctrl.selected).then(
            function (res) {
                ctrl.users[ctrl.selected] = res.data
            },
            function (err) {
            }
        )
    }

    ctrl.doTransfer = function () {
        $http.post('/transfer?index=' + ctrl.selected, ctrl.transfer).then(
            function (res) {
                ctrl.users[ctrl.selected] = res.data
                refreshHistory()
            },
            function (err) {
            }
        )
    }

    ctrl.deleteAmount = function () {
        $http.delete('/user', ctrl.transfer).then(
            function (res) {
                for(let i=0; i<ctrl.users.length; i++)
                {
                    ctrl.users[i].amount=0
                }
            },
            function (err) {
            }
        )
    }

    let refreshUsers = function() {
        $http.get('/user').then(
            function(res) {
                ctrl.users = res.data
            },
            function(err) {}
        )
    }

    let refreshUser = function() {
        $http.get('/user?_id=' + ctrl.users[ctrl.selected]._id).then(
            function(res) {
                ctrl.user = res.data
            },
            function(err) {}
        )
    }

    refreshUsers();

    let refreshHistory = function() {
        $http.get('/transfer?index=' + ctrl.selected).then(
            function(res) {
                ctrl.history = res.data
            },
            function(err) {}
        )
    }


    ctrl.select = function(index) {
        ctrl.selected = index
        refreshUser()
        refreshHistory()
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

    ctrl.deleteData = function() {
        $http.delete('/user?_id=' + ctrl.users[ctrl.selected]._id).then(
            function(res) {
                refreshUsers()
                refreshHistory()
            },
            function(err) {}
        )
    }

    ctrl.formatDate = function (stamp) {
        return new Date(stamp).toLocaleDateString();
    }

}])