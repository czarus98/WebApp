let app = angular.module('WebApp', [])

app.controller('Ctrl', ['$http', function ($http) {
    let ctrl = this

    ctrl.persons = []
    ctrl.classSelected = {}

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

    ctrl.doTransfer = function () {
        $http.post('/transfer', ctrl.transfer).then(
            function (res) {
                ctrl.persons = res.data
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


    ctrl.select = function(index) {
        ctrl.selected = index
        refreshPerson()
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
                refreshPersons();
            },
            function(err) {}
        )
    }

}])