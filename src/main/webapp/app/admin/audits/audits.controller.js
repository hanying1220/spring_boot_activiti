(function() {
    'use strict';

    angular
        .module('erpApp')
        .controller('AuditsController', AuditsController);

    AuditsController.$inject = ['$filter', 'AuditsService', 'ParseLinks','$scope'];

    function AuditsController ($filter, AuditsService, ParseLinks,$scope) {
        $scope.onSelect=function (data){
            console.log(JSON.stringify(data));
        };
        $scope.initTreeP=function (){
            var params={id:1}
            $scope.uiTree.init(params);
        }
        $scope.initTree=function (){
            $scope.uiTree.init();
        }

    }
})();
