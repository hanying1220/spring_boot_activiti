angular
    .module('erpApp')
    .controller('ButtonController', ButtonController);

ButtonController.$inject = ['$scope','permissionService'];

function ButtonController ($scope,permissionService) {

    $scope.permissions=permissionService.getPermissions('menu');

}
