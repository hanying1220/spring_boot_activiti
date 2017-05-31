var app = angular.module('erpApp').controller('PersonalController', PersonalController);

PersonalController.$inject = ['$scope','$http','Principal'];

function PersonalController ($scope,$http,Principal) {
  
    $scope.validateOptions={
        blurTrig: true,//光标移除元素后是否验证并显示错误提示信息
        showError  : true, // 显示错误信息
        removeError: true , // 验证通过后在元素的后面移除错误信息
    }


    function queryUser(param){
        var result =  $http({
            url:'/api/admin/findUserByLogin',
            method:'GET',
            params:param
        });
        return result;
    }

    Principal.identity().then(function(account) {
        $scope.account = account;
        queryUser({login:account.login}).then(function(response){
            $scope.user=response.data;
        })
    });


    $scope.genderOptions = [{value: 1, text: "男"}, {value: 2, text: "女"}];

    $scope.saveUser=  function(){

    }
    $scope.userClose= function (){

    }
}
