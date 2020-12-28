app = angular.module('WebApp')

app.controller('RegisterDialog', ['$http', 'common', '$uibModalInstance', function ($http, common, $uibModalInstance) {
    let ctrl = this

    ctrl.registrationForm = {
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        year: 1990
    }

    ctrl.error = ''

    ctrl.ok = function () {
        $http.post('/register', ctrl.registrationForm).then(
            function (res) {
                $uibModalInstance.close()
            },
            function (err) {
                ctrl.error = 'Rejestracja nieudana'
            }
        )
    }

    ctrl.cancel = function () {
        $uibModalInstance.dismiss('cancel')
    }
}])