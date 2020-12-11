let app = angular.module('WebApp', ['ngRoute', 'ngSanitize', 'ngAnimate', 'ui.bootstrap'])

app.constant('routes', [
    {
        route: '/',
        templateUrl: 'homeView.html',
        controller: 'HomeCtrl',
        controllerAs: 'ctrl',
        menu: '<i class="fa fa-lg fa-home"></i>'
    },
    {
        route: '/users',
        templateUrl: 'usersView.html',
        controller: 'UsersCtrl',
        controllerAs: 'ctrl',
        menu: 'Osoby',
        roles: [1]
    },
    {
        route: '/transfers',
        templateUrl: 'transfersView.html',
        controller: 'TransfersCtrl',
        controllerAs: 'ctrl',
        menu: 'Przelewy',
        roles: [2]
    },
    {
        route: '/groups',
        templateUrl: 'groupsView.html',
        controller: 'GroupsCtrl',
        controllerAs: 'ctrl',
        menu: 'Grupy',
        roles: [4]
    }
])

app.config(['$routeProvider', '$locationProvider', 'routes', function ($routeProvider, $locationProvider, routes) {
    $locationProvider.hashPrefix('')
    for (let i in routes) {
        $routeProvider.when(routes[i].route, routes[i])
    }
    $routeProvider.otherwise({redirectTo: '/'})
}])

app.service('common', ['$http', '$location', 'routes', '$uibModal', function ($http, $location, routes, $uibModal) {
    let common = this

    common.menu = []
    common.sessionData = {}

    common.rebuildMenu = function (nextTick = null) {
        $http.get('/login').then(
            function (res) {
                common.sessionData.login = res.data.login
                common.sessionData.firstName = res.data.firstName
                common.sessionData.role = res.data.role
                common.menu.length = 0
                for (let i in routes) {
                    if (!routes[i].roles || common.sessionData.role in routes[i].roles) {
                        common.menu.push({route: routes[i].route, title: routes[i].menu})
                    }
                }
                $location.path('/')
                if (nextTick) {
                    nextTick()
                }
            },
            function (err) {

            }
        )
    }

    common._alert = {text: '', type: 'alert-success'}

    common.alert = function (type, text) {
        common._alert.type = type
        common._alert.text = text
    }

    common.dialog = function (templateUrl, controllerName, options, nextTick) {
        let modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title-top',
            ariaDescribedBy: 'modal-body-top',
            templateUrl: templateUrl,
            controller: controllerName,
            controllerAs: 'ctrl',
            result: {
                options: function () {
                    return options
                }
            }
        })

        modalInstance.result.then(
            function () {
                nextTick(true)
            },
            function (ret) {
                nextTick(false)
            }
        )
    }

    common.confirm = function (options, nextTick) {
        common.dialog('confirmDialog.html', 'ConfirmDialog', options, nextTick)
    }

    common.formatDate = function (stamp) {
        return new Date(stamp).toLocaleDateString();
    }
}])

app.controller('ConfirmDialog', ['$uibModalInstance', 'options', function ($uibModalInstance, options) {
    let ctrl = this
    ctrl.options = options

    ctrl.ok = function () {
        $uibModalInstance.close()
    }
    ctrl.cancel = function () {
        $uibModalInstance.dismiss('cancel')
    }
}])


app.controller('ContainerCtrl', ['$scope', '$location', 'common', '$http', function ($scope, $location, common, $http) {
    let ctrl = this

    ctrl._alert = common._alert
    ctrl.menu = common.menu
    common.rebuildMenu()

    ctrl.isCollapsed = true
    $scope.$on('$routeChangeSuccess', function () {
        ctrl.isCollapsed = true
    })

    ctrl.navClass = function (page) {
        return page === $location.path() ? 'active' : ''
    }

    ctrl.closeAlert = function () {
        ctrl._alert.text = ''
    }

    ctrl.loginIcon = function () {
        return common.sessionData.login ? common.sessionData.firstName + '&nbsp;<span class="fa fa-lg fa-sign-out"></span>' : '<span class="fa fa-lg fa-sign-in"></span>'
    }

    ctrl.login = function () {
        if (common.sessionData.login) {
            common.confirm({title: 'Wylogowanie', body: 'Czy na pewno chcesz sie wylogować?'}, function (result) {
                if (result) {
                    $http.delete('/login', ctrl.credentials).then(
                        function (res) {
                            common.rebuildMenu(function () {
                                common.alert('alert-success', 'Zostałeś wylogowany')
                            })
                        },
                        function (err) {

                        }
                    )
                }
            })
        } else {
            common.dialog('loginDialog.html', 'LoginDialog', {}, function (result) {
                if (result) {
                    common.rebuildMenu(function () {
                        common.alert('alert-success', 'Witaj, ' + common.sessionData.firstName)
                    })
                }
            })
        }
    }
}])