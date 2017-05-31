

angular.module('erpApp')
    .service('permissionService', ['$http','$state', function($http,$state) {
        var urlName=$state.current.name;
        this.getPermissions=function(name){
            if(!angular.isDefined(name)){
                name=urlName;
            }
            var dataSource =  $http({
                url:'/api/erm/findRoleActionsByMenu',
                method:'GET',
                params:{menulink: name}
            });
            return dataSource;
        }
    }])
.directive('uiPermission', ['permissionService',function (permissionService) {
    return {
        restrict: 'E',
        template: '<div ng-transclude style="height:100%;"></div>',
        transclude:true,
        scope: {
            permissions:'='//数据源  ['add','edit']  or [{value:'add'},{value:'edit'}]
        },
        controller:['$scope',function($scope){

        }],
        link: function (scope, elem, attrs,ctrl) {
            //if(scope.permissions==null){
            //    scope.permissions=permissionService.getPermissions();
            //}
        }
    }
}])
.directive('permissionCode',[ function() {
    return {
        require: '?^uiPermission',
        controller:['$scope',function($scope){

        }],
        link: function(scope, elem, attrs,ctrl) {
            //var permissions=getPermissions(scope);
            //if(permissions!=null){
            //    permissions.then(function(data){
            //        loadPermission(data.data);
            //    });
            //}
            function getPermissions(parent){
                if(parent.permissions==null){
                    if(parent.$parent!=null){
                        return getPermissions(parent.$parent);
                    }else{
                        return null;
                    }
                }else{
                    return parent.permissions;
                }
            }
            function loadPermission(data){
                var hidden=true;
                angular.forEach(data,function(item){
                    if(typeof(item)=='string'){
                        if(item==attrs.permissionCode){
                            hidden=false;
                        }
                    }
                    if(typeof(item)=='object'){
                        if(angular.lowercase(item.value)==angular.lowercase(attrs.permissionCode)){
                            hidden=false;
                        }
                    }
                });
                if(hidden){
                    elem[0].style.display="none";
                    elem[0].style.visibility="hidden";
                }else{
                    elem[0].style.visibility="";
                }
            }
        }
    }
}]);
