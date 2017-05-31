angular.module('erpApp')
    .service('usermanageService', ['$http', function($http) {
        this.getAllUsers=function(param){
            var result =  $http({
                url:'/api/admin/findAllUsers',
                method:'GET',
                params:param
            });
            return result;
        }

        this.setUserActivated=function(param){
            var result =  $http({
                url:'/api/admin/updateUserActivated',
                method:'GET',
                params:param
            });
            return result;
        }
    }]);
