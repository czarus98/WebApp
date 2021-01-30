app = angular.module('WebApp')

app.controller('PasswordDialog', ['$http', 'common', '$uibModalInstance', function ($http, common, $uibModalInstance) {
    let ctrl = this

    ctrl.passwordForm = {
        newPassword: '',
        repeatPassword: ''
    }

    ctrl.error = ''

    ctrl.ok = function () {
        $http.put('/passwordChange', ctrl.passwordForm).then(
            function (res) {
                $uibModalInstance.close()
            },
            function (err) {
                ctrl.error = 'Zmiana hasła się nie powiodła'
            }
        )
    }

    ctrl.cancel = function () {
        $uibModalInstance.dismiss('cancel')
    }
}])