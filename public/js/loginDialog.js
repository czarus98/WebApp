app = angular.module('WebApp')

app.controller('LoginDialog', ['$http', 'common', '$uibModalInstance', function ($http, common, $uibModalInstance) {
    let ctrl = this

    ctrl.sessionData = common.sessionData
    ctrl.credentials = { login: '', password: '' }
    ctrl.error = ''

    ctrl.ok = function() {
        $http.post('/login', ctrl.credentials).then(
            function(res) {
                $uibModalInstance.close()
            },
            function(err) {
                ctrl.error = 'Logowanie nieudane'
            }
        )
    }

    ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel')
    }
}])