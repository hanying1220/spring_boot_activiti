(function() {
    'use strict';
angular
    .module('erpApp')
    .controller('TreeDemoController', TreeDemoController);
    TreeDemoController.$inject = ['$scope', '$http', '$timeout', '$interval','layer'];

    function TreeDemoController ($scope, $http, $timeout, $interval,layer) {
        var loadWeiGridData=function(){
            $http({
                url:'/api/process/bishi',
                method:'GET'
            }).success(function(data,header,config,status){
                console.log(data);
                $scope.gridOptionsWei.data=data;
            }).error(function(data,header,config,status){

            });
        };

        var loadYiGridData=function(){
            $http({
                url:'/api/process/bishi',
                method:'GET',
                params:{type:"my"}
            }).success(function(data,header,config,status){
                console.log(data);
                $scope.gridOptionsYi.data=data;
            }).error(function(data,header,config,status){

            });
        };

        $scope.startp=function(){
            $http({
                url:'/api/process/start',
                method:'GET'
            }).success(function(data,header,config,status){
                console.log(data);
                loadWeiGridData();
            }).error(function(data,header,config,status){

            });
        }

        $scope.jie=function(row){
            console.log(row);
            $http({
                url:'/api/process/jie',
                method:'GET',
                params:{taskId:row.entity.id}
            }).success(function(data,header,config,status){
                loadWeiGridData();
                loadYiGridData();
            }).error(function(data,header,config,status){

            });
        }
        $scope.wan=function(row){
            console.log(row);
            layer.open({
                type   : 1,
                title:'流程审核',
                content: '<button class="btn btn-sm btn-primary" ng-click="ad('+row.entity.id+',1)">同意</button>               <button class="btn btn-sm btn-primary" ng-click="ad('+row.entity.id+',2)">不同意</button>',
                scope:$scope,
            });
/*            ;*/
        }
        $scope.ad=function(param1,param){
            $http({
                url:'/api/process/wan',
                method:'GET',
                params:{taskId:param1,deptLeaderPass:(param==1?true:false)}
            }).success(function(data,header,config,status){
                loadYiGridData();
            }).error(function(data,header,config,status){

            })
        }
        var cellTemplate1='<ui-button class="grid-btn danger-bg" icoclass="iconfont icon-password" permission-code="qiyong" ng-click="grid.appScope.jie(row)" title="领取任务"/>'
        var cellTemplate2='<ui-button class="grid-btn primary-bg" icoclass="iconfont icon-fenpeijiaose" permission-code="qiyong"  ng-click="grid.appScope.wan(row)" title="完成任务"/>';
        var colModel1=[
            { field: 'id',displayName: '操作', width: '20%', cellTemplate:cellTemplate1 ,enableColumnMenu:false,enableSorting:false },
            { field: 'id', displayName: '编号',type: 'text', width: '5%',cellTooltip: true ,enableColumnMenu:false,enableSorting:false },
            { field: 'name', displayName: '名称',type: 'text', width: '20%',cellTooltip: true,enableColumnMenu:false,enableSorting:false },

        ];
        var colModel2=[
            { field: 'id',displayName: '操作', width: '20%', cellTemplate:cellTemplate2 ,enableColumnMenu:false,enableSorting:false },
            { field: 'id', displayName: '编号',type: 'text', width: '5%',cellTooltip: true ,enableColumnMenu:false,enableSorting:false },
            { field: 'name', displayName: '名称',type: 'text', width: '20%',cellTooltip: true,enableColumnMenu:false,enableSorting:false },

        ];
        $scope.gridOptionsWei={
            data:$scope.MyData,
            paginationPageSizes: [5,30,40,50],
            paginationPageSize: 5,
            useExternalPagination: true,
            columnDefs: colModel1,
            //showTreeExpandNoChildren:false,
            onRegisterApi : function(gridApi) {
                $scope.orgzgridApi=gridApi;
                gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                    pageData.page = newPage-1;
                    pageData.size = pageSize;
                    loadGridData(pageData,$scope.selectNode,$scope.search.searchName);
                });
            }
        };
        $scope.gridOptionsYi={
            data:$scope.MyData,
            paginationPageSizes: [5,30,40,50],
            paginationPageSize: 5,
            useExternalPagination: true,
            columnDefs: colModel2,
            //showTreeExpandNoChildren:false,
            onRegisterApi : function(gridApi) {
                $scope.orgzgridApi=gridApi;
                gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                    pageData.page = newPage-1;
                    pageData.size = pageSize;
                    loadGridData(pageData,$scope.selectNode,$scope.search.searchName);
                });
            }
        };
        loadYiGridData();
        loadWeiGridData();
    };
})();

