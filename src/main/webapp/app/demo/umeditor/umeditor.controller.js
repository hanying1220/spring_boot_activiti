       angular
        .module('erpApp')
        .controller('umetitorController', FormTestController);

    FormTestController.$inject = ['$rootScope','$scope','$cookies'];

    function FormTestController($rootScope,$scope,$cookies) {

        //headers: {"X-CSRF-TOKEN":$cookies.get('CSRF-TOKEN')}
        $scope.all_config = {
            imageUrl: "api/upload2"
            ,imagePath:""
            ,imageFieldName: "file"
            ,zIndex:9999
            ,autoHeightEnabled:false
            ,csrfToken:$cookies.get('CSRF-TOKEN')
        };

        $scope.all_text='你好！';
        $scope.myid = new Date().getTime().toString();

        $scope.on=function(){
            UM.getEditor($scope.myid).setEnabled();
            UM.getEditor($scope.myid).fireEvent('selectionchange');
        };
        $scope.off=function(){
            UM.getEditor($scope.myid).setDisabled('fullscreen');
        };
    }

