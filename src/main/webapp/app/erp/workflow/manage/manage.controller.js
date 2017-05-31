angular
    .module('erpApp')
    .controller('WorkflowController', WorkflowController);

WorkflowController.$inject = ['$scope','$http','$state','layer','Upload'];

function WorkflowController ($scope,$http,$state,layer,Upload) {

    initData();
    initModelData();
    initRuningData();

    var cellTemplate='<ui-button class="grid-btn primary-bg" icoclass="iconfont icon-gougou" ng-click="grid.appScope.start(row)"   title="启动"  />' +
        '<ui-button class="grid-btn primary-bg" icoclass="iconfont icon-bianji" ng-click="grid.appScope.convert(row)"   title="转换为模板"  />' +
        '<ui-button class="grid-btn danger-bg" icoclass="iconfont icon-del" ng-click="grid.appScope.remove(row)" title="删除"  />';

    var cellTemplate2='<a target="_blank" ng-href="/api/workflow/resource/read?processDefinitionId={{row.entity.id}}&resourceType=xml">{{COL_FIELD}}</a>';
    var cellTemplate3='<a ng-click="grid.appScope.reviewImage(row)">{{COL_FIELD}}</a>';

    var colModel=[
        { field: 'id',displayName: '操作', width: '15%', cellTemplate:cellTemplate},
        { field: 'id', displayName: 'ProcessDefinitionId',type: 'text', width: '10%'},
        { field: 'deploymentId', displayName: 'DeploymentId',type: 'text', width: '10%'},
        { field: 'name', displayName: '名称',type: 'text', width: '10%'},
        { field: 'key', displayName: 'KEY',type: 'text', width: '10%'},
        { field: 'version', displayName: '版本号',type: 'text', width: '10%'},
        { field: 'resource', displayName: 'XML',type: 'text', width: '10%',cellTemplate:cellTemplate2},
        { field: 'image', displayName: '图片',type: 'text', width: '10%',cellTemplate:cellTemplate3},
        { field: 'deploymentTime', displayName: '部署时间',type: 'text', width: '10%'},
        { field: 'suspended', displayName: '是否挂起',type: 'text', width: '5%'}
    ];

    $scope.gridOptions={
        columnDefs: colModel,
        enableColumnMenus:false,
        onRegisterApi : function(gridApi) {
            $scope.gridApi = gridApi;
        }
    }

    var runing_cellTemplate='<ui-button class="grid-btn primary-bg" icoclass="iconfont icon-bianji" ng-click="grid.appScope.edit(row)"   title="编辑"  />' +
        '<ui-button class="grid-btn danger-bg" icoclass="iconfont icon-del" ng-click="grid.appScope.removeRuning(row)" title="删除"  />';
    var runing_cellTemplate2='<a ng-click="grid.appScope.reviewImage2(row)">{{COL_FIELD}}</a>';

    var runing_colModel=[
        { field: 'id',displayName: '操作', width: '15%', cellTemplate:runing_cellTemplate},
        { field: 'id', displayName: '实例ID',type: 'text', width: '10%',cellTooltip: true},
        { field: 'name', displayName: '实例名称',type: 'text', width: '10%',cellTooltip: true},
        { field: 'definitionId', displayName: '流程定义ID',type: 'text', width: '10%',cellTooltip: true},
        { field: 'deploymentId', displayName: '部署ID',type: 'text', width: '10%',cellTooltip: true},
        { field: 'activityId', displayName: 'activityID',type: 'text', width: '10%',cellTooltip: true},
        { field: 'nodeName', displayName: '当前节点',type: 'text', width: '10%',cellTemplate:runing_cellTemplate2},
        { field: 'suspended', displayName: '是否挂起',type: 'text', width: '5%',cellTooltip: true}
    ];

    $scope.runingOptions={
        columnDefs: runing_colModel,
        enableColumnMenus:false,
        onRegisterApi : function(gridApi) {
            gridApi.grid.element.width($scope.gridApi.grid.element.width());
        }
    }



    var model_cellTemplate='<ui-button class="grid-btn primary-bg" icoclass="iconfont icon-gougou" ng-click="grid.appScope.deployModel(row)"   title="部署"  />' +
        '<ui-button class="grid-btn primary-bg" icoclass="iconfont icon-bianji" ng-click="grid.appScope.editModel(row)" title="编辑"  />' +
        '<ui-button class="grid-btn danger-bg" icoclass="iconfont icon-del" ng-click="grid.appScope.removeModel(row)" title="删除"  />';

    var model_colModel=[
        { field: 'id',displayName: '操作', width: '15%', cellTemplate:model_cellTemplate},
        { field: 'id', displayName: 'ID',type: 'text', width: '10%',cellTooltip: true},
        { field: 'name', displayName: '名称',type: 'text', width: '10%',cellTooltip: true},
        { field: 'key', displayName: 'KEY',type: 'text', width: '10%',cellTooltip: true},
        { field: 'deploymentId', displayName: '部署ID',type: 'text', width: '10%',cellTooltip: true},
        { field: 'createTime', displayName: '创建时间',type: 'text', width: '10%',cellTooltip: true},
        { field: 'lastUpdateTime', displayName: '最后更新时间',type: 'text', width: '10%'}
    ];

    $scope.modelOptions={
        columnDefs: model_colModel,
        enableColumnMenus:false,
        onRegisterApi : function(gridApi) {
            gridApi.grid.element.width($scope.gridApi.grid.element.width());
        }
    }


    $scope.reviewImage=function(row){
        $scope.dialog=layer.open({
            type: 1,
            title:  '查看流程图',
            area   : ['1000px','800px'],
            resize:false,
            maxmin:true,
            shadeClose:true,
            content: '<img src="/api/workflow/resource/read?processDefinitionId='+row.entity.id+'&resourceType=image"/>',
            scope:$scope,
            cancel:function(index){
                layer.close(index);
            }
        });
    }
    $scope.reviewImage2=function(row){
        $scope.dialog=layer.open({
            type: 1,
            title:  '查看跟踪流程图',
            area   : ['1000px','800px'],
            resize:false,
            maxmin:true,
            shadeClose:true,
            content: '<img src="/api/workflow/trace?executionId='+row.entity.id+'"/>',
            scope:$scope,
            cancel:function(index){
                layer.close(index);
            }
        });
    }

    $scope.convert=function(row){
        layer.confirm('确定要此流程转为模板吗？', {
            btn: ['取消', '确认'],
            btn2: function(index, layero){
                var result =  $http({
                    url:'/api/workflow/convert-to-model/'+row.entity.id,
                    method:'GET',
                    params: {}
                });
                result.then(function(response){
                    var data=response.data;
                    if(data.success){
                        layer.msg('转换成功,模板ID：'+data.id, {icon: 5});
                        initModelData();
                    }else{
                        layer.msg('转换失败', {icon: 2});
                    }
                });
            }
        }, function(index, layero){
            layer.close(index);
        });
    }

    $scope.remove=function(row){
        layer.confirm('确定要删除该流程部署吗？', {
            btn: ['取消', '确认'],
            btn2: function(index, layero){
                var result =  $http({
                    url:'/api/workflow/deldeploy',
                    method:'POST',
                    params: {deploymentId:row.entity.deploymentId}
                });
                result.then(function(response){
                    initData();
                });
            }
        }, function(index, layero){
            layer.close(index);
        });
    }
    $scope.removeRuning=function(row){
        layer.confirm('确定要删除该流程实例吗？', {
            btn: ['取消', '确认'],
            btn2: function(index, layero){
                var result =  $http({
                    url:'/api/workflow/delinstance',
                    method:'POST',
                    params: {instanceId:row.entity.id}
                });
                result.then(function(response){
                    initRuningData();
                });
            }
        }, function(index, layero){
            layer.close(index);
        });
    }
    $scope.removeModel=function(row){
        layer.confirm('确定要删除该模型吗？', {
            btn: ['取消', '确认'],
            btn2: function(index, layero){
                var result =  $http({
                    url:'/api/workflow/model/delete/'+row.entity.id,
                    method:'POST',
                    params: {}
                });
                result.then(function(response){
                    initModelData();
                });
            }
        }, function(index, layero){
            layer.close(index);
        });
    }

    $scope.upload = function (file) {
        Upload.upload({
            url: '/api/workflow/deploy',
            data: {file: file}
        }).then(function (resp) {
            console.log(resp);
            var data=resp.data;
            if(data.success){
                initData();
                layer.msg('部署成功[id:'+data.id+',name:'+data.name+']', {icon: 5});
            }else{
                layer.msg('流程部署失败', {icon: 5});
            }
        }, function (resp) {
            console.log('Error status: ' + resp.status);
        }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
        });
    };

    var vm1 = $scope.vm1 = {
        htmlSource: "",
        showErrorType: "1",
        showDynamicElement: true,
        dynamicName: "dynamicName",
        model: {}
    };
    // 新增模板弹出框
    $scope.create=function(){
        vm1.model={
            key:'',
            name:'',
            description:''
        };
        $scope.modelDailog=layer.open({
            type: 1,
            title:  '创建模板',
            area   : ['400px', '300px'],
            contentUrl: 'app/erp/workflow/manage/dialog/model-dialog.html',
            scope:$scope,
            resize:false
        });

        $scope.modelClose = function(){
            layer.close($scope.modelDailog);
        }
    };
    vm1.addModel = function () {
        var model=vm1.model;
        var result =  $http({
            url:'/api/workflow/model/create',
            method:'POST',
            params:{
                key:model.key,
                name:model.name,
                description:model.description
            }
        });
        result.then(function(response){
            layer.close($scope.modelDailog);
            var data=response.data;
            if(data.success){
                layer.msg('模板创建成功,模板ID：'+data.id, {icon: 5});
                initModelData();
                window.open('/modeler.html?modelId='+data.id,'_blank');
            }else{
                layer.msg('模板创建失败', {icon: 2});
            }
        })
    };

    $scope.editModel = function (row) {
        window.open('/modeler.html?modelId='+row.entity.id,'_blank');
    };

    $scope.deployModel = function (row) {
        layer.confirm('确定将此模板部署成流程？', {
            btn: ['取消', '确认'],
            btn2: function(index, layero){
                var result =  $http({
                    url:'/api/workflow/model/deploy/'+row.entity.id,
                    method:'GET'
                });
                result.then(function(response){
                    var data=resp.data;
                    if(data.success){
                        initData();
                        layer.msg('部署成功，部署ID：'+data.id, {icon: 5});
                    }else{
                        layer.msg('流程部署失败', {icon: 5});
                    }
                });
            }
        }, function(index, layero){
            layer.close(index);
        });
    };

    $scope.shuaxin=function(){
        initData();
    }
    $scope.shuaxin2=function(){
        initRuningData();
    }
    $scope.shuaxin3=function(){
        initModelData();
    }

    $scope.start=function(row){
        var result =  $http({
            url:'/api/workflow/start',
            method:'GET',
            params:{
                key:row.entity.key
            }
        });
        result.then(function(response){
            var data=response.data;
            layer.msg('流程实例ID：'+data.id, {icon: 5});
        })
    }

    function initData(){
        var result =  $http({
            url:'/api/workflow/process',
            method:'GET'
        });
        result.then(function(response){
            $scope.gridOptions.data=response.data;
        })
    }
    function initRuningData(){
        var result =  $http({
            url:'/api/workflow/runing',
            method:'GET'
        });
        result.then(function(response){
            $scope.runingOptions.data=response.data;
        })
    }
    function initModelData(){
        var result =  $http({
            url:'/api/workflow/model/list',
            method:'GET'
        });
        result.then(function(response){
            $scope.modelOptions.data=response.data;
        })
    }

}
