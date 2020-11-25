app = angular.module('WebApp')

app.controller('GroupsCtrl', ['$http', function ($http) {
    let ctrl = this

    ctrl.groups = []
    ctrl.selected = -1

    ctrl.newGroup = {
        name: ''
    }

    let refreshGroups = function () {
        $http.get('/group').then(
            function (res) {
                ctrl.groups = res.data
            },
            function (err) {
            }
        )
    }

    let refreshGroup = function () {
        $http.get('/group?_id=' + ctrl.groups[ctrl.selected]._id).then(
            function (res) {
                ctrl.group = res.data
            },
            function (err) {
            }
        )
    }

    refreshGroups();

    ctrl.insertNewData = function () {
        $http.post('/group', ctrl.newGroup).then(
            function (res) {
                refreshGroups()
            },
            function (err) {
            }
        )
    }

    ctrl.select = function (index) {
        ctrl.selected = index
        refreshGroup()
    }

    ctrl.updateData = function () {
        $http.put('/group?_id=' + ctrl.groups[ctrl.selected]._id, ctrl.group).then(
            function (res) {
                refreshGroups()
            },
            function (err) {
            }
        )
    }

    ctrl.deleteData = function () {
        $http.delete('/group?_id=' + ctrl.groups[ctrl.selected]._id).then(
            function (res) {
                refreshGroups()
            },
            function (err) {
            }
        )
    }
}])