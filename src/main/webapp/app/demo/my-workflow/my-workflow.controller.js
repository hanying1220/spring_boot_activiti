(function() {
    'use strict';

    angular
        .module('erpApp')
        .controller('MyWorkflowController', MyWorkflowController);

    MyWorkflowController.$inject = ['$scope','$http','$state','layer'];

    function MyWorkflowController($scope,$http,$state,layer) {

        initData();
        initDoneData();

        var cellTemplate='<ui-button class="grid-btn primary-bg" icoclass="iconfont icon-gougou" ng-click="grid.appScope.complete(row)"   title="处理"  />'+
            '<ui-button class="grid-btn primary-bg" icoclass="iconfont icon-bianji" ng-click="grid.appScope.tojump(row)"   title="跳转"  />';
        var colModel=[
            { field: 'id',displayName: '操作', width: '15%', cellTemplate:cellTemplate},
            { field: 'id', displayName: '任务ID',type: 'text', width: '10%'},
            { field: 'name', displayName: '名称',type: 'text', width: '10%'},
            { field: 'definitionId', displayName: 'definitionId',type: 'text', width: '10%'},
            { field: 'instanceId', displayName: 'instanceId',type: 'text', width: '10%'},
            { field: 'definitionKey', displayName: 'definitionKey',type: 'text', width: '10%'},
            { field: 'assignee', displayName: '处理人',type: 'text', width: '10%'},
            { field: 'createTime', displayName: '创建时间',type: 'text', width: '10%'}
        ];

        $scope.gridOptions={
            data:[],
            columnDefs: colModel,
            enableColumnMenus:false,
            onRegisterApi : function(gridApi) {
                $scope.gridApi = gridApi;

            }
        }

        function initData(){
            var result =  $http({
                url:'/api/workflow/mywork',
                method:'GET'
            });
            result.then(function(response){
                $scope.gridOptions.data=response.data;
            })
        }
        $scope.complete=function(row){
            var result =  $http({
                url:'/api/workflow/complete',
                method:'POST',
                params:{
                    taskId:row.entity.id,
                    keys:'role,isAudit',
                    values:'1,true'
                }
            });
            result.then(function(response){
                layer.msg('任务完成', {icon: 5});
                initData();
                initDoneData();
            })
        }



        var colModel2=[
            { field: 'id', displayName: 'ID',type: 'text', width: '10%'},
            { field: 'name', displayName: '名称',type: 'text', width: '10%'},
            { field: 'definitionId', displayName: 'definitionId',type: 'text', width: '10%'},
            { field: 'startUserId', displayName: 'startUserId',type: 'text', width: '10%'},
            { field: 'startTime', displayName: '开始时间',type: 'text', width: '10%'},
            { field: 'endTime', displayName: '结束时间',type: 'text', width: '10%'}
        ];

        $scope.doneOptions={
            data:[],
            columnDefs: colModel2,
            enableColumnMenus:false,
            onRegisterApi : function(gridApi) {
                $scope.gridApi2 = gridApi;
            }
        }

        function initDoneData(){
            var result =  $http({
                url:'/api/workflow/done',
                method:'GET'
            });
            result.then(function(response){
                $scope.doneOptions.data=response.data;
            })
        }
        var vm1=$scope.vm1= {
            htmlSource: "",
            showErrorType: "1",
            showDynamicElement: true,
            dynamicName: "dynamicName",
            model: {}
        };

        $scope.tojump=function(row){
            vm1.model={
                processInstanceId:row.entity.instanceId,
                activityId:''
            };
            $scope.modelDailog=layer.open({
                type: 1,
                title:  '创建模板',
                area   : ['400px', '300px'],
                contentUrl: 'app/demo/my-workflow/dialog.html',
                scope:$scope,
                resize:false
            });

            $scope.modelClose = function(){
                layer.close($scope.modelDailog);
            }
        };

        $scope.jump=function(){
            var model=vm1.model;
            var result =  $http({
                url:'/api/workflow/jump',
                method:'POST',
                params:{
                    processInstanceId:model.processInstanceId,
                    activityId:model.activityId
                }
            });
            result.then(function(response){
                layer.close($scope.modelDailog);
                var data=response.data;
                if(data.success){
                    layer.msg('跳转成功', {icon: 5});
                    initData();
                }else{
                    layer.msg('跳转失败', {icon: 2});
                }
            })
        };
    }
})();
