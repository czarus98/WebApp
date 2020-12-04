let app = angular.module('WebApp', ['ngRoute', 'ngSanitize'])

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
        roles: [1, 2]
    },
    {
        route: '/transfers',
        templateUrl: 'transfersView.html',
        controller: 'TransfersCtrl',
        controllerAs: 'ctrl',
        menu: 'Przelewy'
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

app.service('common', ['$http', '$location', 'routes', function ($http, $location, routes) {
    let common = this

    common.menu = []
    common.sessionData = {}

    common.rebuildMenu = function () {
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
            },
            function (err) {

            }
        )
    }
}])

app.controller('ContainerCtrl', ['$scope', '$location', 'common', function ($scope, $location, common) {
    let ctrl = this

    ctrl.menu = common.menu
    common.rebuildMenu()

    ctrl.isCollapsed = true
    $scope.$on('$routeChangeSuccess', function () {
        ctrl.isCollapsed = true
    })

    ctrl.navClass = function (page) {
        return page === $location.path() ? 'active' : ''
    }
}])