(function() {
    'use strict';

    angular
        .module('erpApp')
        .controller('TreeController', TreeController);

    TreeController.$inject = ['$scope', '$state', '$timeout', 'Auth'];

    function TreeController ($scope, $state, $timeout, Auth) {
        $scope.name="点击树";
    }
})();
