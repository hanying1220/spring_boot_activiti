var erpApp=angular.module('erpApp');
erpApp.controller('validateCtrl', TestController);
    TestController.$inject = ['$scope', '$http','$uibModal','Upload'];
    function TestController($scope, $http,$uibModal,Upload) {
    //下拉框下拉值
    selectValue($scope,$http);
    //图片上传
   // imageUpload($scope,$http);
   // fileUpload($scope,Upload);
    //下拉树
    selectTree($scope);
        $scope.value = 75;
        $scope.min = 10;
        $scope.max = 90;
    var vm = $scope.vm = {
        htmlSource: "",
        showErrorType: "1",
        showDynamicElement: true,
        dynamicName: "dynamicName",
        entity: {}
    };
        var $q=this;
   // vm.showFormValidate=showFormValidate;
    vm.saveEntity = function ($event) {
        //do somethings for bz
        alert("Save Successfully!!!");
    };

    //每个表单的配置，如果不设置，默认和全局配置相同
    vm.validateOptions = {
        blurTrig: true
    };

    vm.customizer = function () {
        return vm.entity.customizer > vm.entity.number;
    };

    vm.changeShowType = function () {
        if (vm.showErrorType == 2) {
            vm.validateOptions.showError = false;
            vm.validateOptions.removeError = false;
        } else {
            vm.validateOptions.showError = true;
            vm.validateOptions.removeError = true;
        }
    };

    vm.types = [
        {
            value: 1,
            text: "选择框"
        },
        {
            value: 2,
            text: "输入框"
        }
    ];
}
//图片上传
function   imageUpload($scope,$http){
    $scope.single = function(image) {
        var formData = new FormData();
        formData.append('image', image, image.name);
        $http.post('upload', formData, {
            headers: { 'Content-Type': false },
            transformRequest: angular.identity
        }).success(function(result) {
            $scope.uploadedImgSrc = result.src;
            $scope.sizeInBytes = result.size;
        });
    };
}

//下拉框
function selectValue($scope,$http){
    $http.get('/app/demo/form/shopArr.json')
        .success(function (data) {
            $scope.shopArr = data;
        });

}
//文件上传
function fileUpload($scope, Upload){
    $scope.uploadImg = '';
    //提交
    $scope.submit = function () {
        $scope.upload($scope.file);
    };
    $scope.upload = function (file) {
        $scope.fileInfo = file;
        Upload.upload({
            //服务端接收
            url: 'Ashx/UploadFile.ashx',
            //上传的同时带的参数
            data: {'username': $scope.username},
            //上传的文件
            file: file
        }).progress(function (evt) {
            //进度条
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progess:' + progressPercentage + '%' + evt.config.file.name);
        }).success(function (data, status, headers, config) {
            //上传成功
            console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
            $scope.uploadImg = data;
        }).error(function (data, status, headers, config) {
            //上传失败
            console.log('error status: ' + status);
        });
    };

}
//下拉树
function selectTree($scope){
    var data1 = [];
    for (var i = 0; i < 7; i++) {
        var obj = {
            id: i,
            name: 'Node ' + i,
            children: []
        };

        for (var j = 0; j < 3; j++) {
            var obj2 = {
                id: j,
                name: 'Node ' + i + '.' + j,
                children: []
            };
            obj.children.push(obj2);
        }

        data1.push(obj);
    }

    data1[1].children[0].children.push({
        id: j,
        name: 'Node sub_sub 1',
        children: [],
        selected: true
    });

    $scope.data = angular.copy(data1);

    var data3 = [];

    for (var i = 0; i < 7; i++) {
        var obj3 = {
            id: i,
            name: 'Node new view ' + i
        };
        data3.push(obj3);
    }


    $scope.selectOnly1Or2 = function(item, selectedItems) {
        if (selectedItems  !== undefined && selectedItems.length >= 20) {
            return false;
        } else {
            return true;
        }
    };

    $scope.switchViewCallback = function(scopeObj) {

        if (scopeObj.switchViewLabel == 'test2') {
            scopeObj.switchViewLabel = 'test1';
            scopeObj.inputModel = data1;
            scopeObj.selectOnlyLeafs = true;
        } else {
            scopeObj.switchViewLabel = 'test2';
            scopeObj.inputModel = data3;
            scopeObj.selectOnlyLeafs = false;
        }
    }
}

 erpApp.directive('stringToNumber', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function(value) {
                return '' + value;
            });
            ngModel.$formatters.push(function(value) {
                return parseFloat(value);
            });
        }
    };
});

