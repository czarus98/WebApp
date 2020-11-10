let app = angular.module('WebApp', [])

app.controller('Ctrl', ['$http', function ($http) {
    let ctrl = this

    ctrl.persons = []

    ctrl.transfer = {
        delta: 0
    }

    ctrl.history = []

    $http.get('/person').then(
        function (res) {
            ctrl.persons = res.data
        },
        function (err) {
        }
    )

    ctrl.insertNewData = function() {
        $http.post('/person', ctrl.newPerson).then(
            function(res) {
                ctrl.persons.push(res.data)
            },
            function(err) {}
        )
    }

    ctrl.getTransfer = function () {
        $http.get('/transfer?index=' + ctrl.selected).then(
            function (res) {
                ctrl.persons[ctrl.selected] = res.data
            },
            function (err) {
            }
        )
    }

    ctrl.doTransfer = function () {
        $http.post('/transfer?index=' + ctrl.selected, ctrl.transfer).then(
            function (res) {
                ctrl.persons[ctrl.selected] = res.data
                refreshHistory()
            },
            function (err) {
            }
        )
    }

    ctrl.deleteAmount = function () {
        $http.delete('/person', ctrl.transfer).then(
            function (res) {
                for(let i=0;i<ctrl.persons.length;i++)
                {
                    ctrl.persons[i].amount=0
                }
            },
            function (err) {
            }
        )
    }

    let refreshPersons = function() {
        $http.get('/person').then(
            function(res) {
                ctrl.persons = res.data
            },
            function(err) {}
        )
    }

    refreshPersons();

    let refreshPerson = function() {
        $http.get('/person?index=' + ctrl.selected).then(
            function(res) {
                ctrl.person = res.data
            },
            function(err) {}
        )
    }

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
        refreshPerson()
        refreshHistory()
    }

    ctrl.updateData = function () {
        $http.put('/person?index=' + ctrl.selected, ctrl.person).then(
            function (res) {
                refreshPersons()
            },
            function (err) {
            }
        )
    }

    ctrl.deleteData = function() {
        $http.delete('/person?index=' + ctrl.selected).then(
            function(res) {
                refreshPersons()
                refreshHistory()
            },
            function(err) {}
        )
    }

    ctrl.formatDate = function (stamp) {
        return new Date(stamp).toLocaleDateString();
    }

}])