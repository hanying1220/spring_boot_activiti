angular
    .module('erpApp')
    .controller('NavController', NavController);

NavController.$inject = ['$scope','$http'];

function NavController ($scope,$http) {
    $http.get('/api/erm/findUserMenus')
        .success(function(data) {
            loadMenus(data);
        });

    function loadMenus(menus){
        var results=[];
         angular.forEach(menus,function(menu){
             var result={};
             if(menu.parent==null){
                 if(noExists(results,menu.id)){
                     results.push($.extend(null,{menus:[]},menu));
                 }
             }else{
                 if(noExists(results,menu.parent.id)){
                     results.push($.extend(null,{menus:[]},menu.parent));
                 }
             }
         });
        angular.forEach(results,function(result){
            angular.forEach(menus,function(menu){
                if(menu.parent!=null){
                     if(menu.parent.id==result.id){
                         result.menus.push(menu);
                     }
                }
            });
        });
        $scope.menus=results;

        //var menus=[];
        //angular.forEach(results,function(result){
        //    if(result.menus!=null && result.menus.length>0){
        //        menus.push(result);
        //    }
        //});
        //$scope.menus=menus;

    }

    function noExists(results,id){
        var flag=true;
        angular.forEach(results,function(result){
            if(result.id==id){
                flag = false;
            }
        })
        return  flag;
    }

}
