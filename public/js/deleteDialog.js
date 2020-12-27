app = angular.module('WebApp')

app.controller('DeleteDialog', ['$http', 'common', '$uibModalInstance', function ($http, common, $uibModalInstance) {
    let ctrl = this

    ctrl.ok = function () {
        $uibModalInstance.close()
    }

    ctrl.cancel = function () {
        $uibModalInstance.dismiss('cancel')
    }
}])