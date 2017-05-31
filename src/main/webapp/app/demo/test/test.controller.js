var erpApp=angular.module('erpApp');
erpApp.controller('validateCtrltest', TestController);
TestController.$inject = ['$scope', '$http'];
function TestController($scope, $http) {
    $scope.dataParamsUrl = 'app/demo/test/formlayout.json';//编辑时输入api/user.action
    $scope.open=function(){
        console.log('打开弹出框');
        $('#mydialog').modal('show');
        $scope.types = [
            {
                value: 1,
                text: "男"
            },
            {
                value: 2,
                text: "女"
            }
        ];
    };
    $scope.confirm=function(){
        alert('点击了确认按钮');
    };
}




