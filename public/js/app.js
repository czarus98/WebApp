let app = angular.module('WebApp', ['ngRoute', 'ngSanitize'])

app.constant('routes', [
    {
        route: '/',
        templateUrl: 'homeView.html',
        controller: 'HomeCtrl',
        controllerAs: 'ctrl',
        menu: '<i class="fa fa-lg fa-home"></i>'
    },
    {route: '/users', templateUrl: 'usersView.html', controller: 'UsersCtrl', controllerAs: 'ctrl', menu: 'Osoby'},
    {
        route: '/transfers',
        templateUrl: 'transfersView.html',
        controller: 'TransfersCtrl',
        controllerAs: 'ctrl',
        menu: 'Przelewy'
    },
    {route: '/groups', templateUrl: 'groupsView.html', controller: 'GroupsCtrl', controllerAs: 'ctrl', menu: 'Grupy'}
])

app.config(['$routeProvider', '$locationProvider', 'routes', function ($routeProvider, $locationProvider, routes) {
    $locationProvider.hashPrefix('')
    for (let i in routes) {
        $routeProvider.when(routes[i].route, routes[i])
    }
    $routeProvider.otherwise({redirectTo: '/'})
}])

app.controller('ContainerCtrl', ['$http', '$scope', '$location', 'routes', function ($http, $scope, $location, routes) {
    let ctrl = this

    let rebuildMenu = function () {
        ctrl.menu = []
        for (let i in routes) {
            ctrl.menu.push({route: routes[i].route, title: routes[i].menu})
        }
        $location.path('/')
    }
    rebuildMenu()

    ctrl.isCollapsed = true
    $scope.$on('$routeChangeSuccess', function () {
        ctrl.isCollapsed = true
    })

    ctrl.navClass = function (page) {
        return page === $location.path() ? 'active' : ''
    }
}])