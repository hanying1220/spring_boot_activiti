var app = angular.module('erpApp').controller('UsermanageController', UsermanageController);
app.filter('format', function () {
    return function (input) {
        if (input) {
            return "可用";
        }else{
            return "禁用";
        }
    }
});
UsermanageController.$inject = ['$scope','usermanageService'];

function UsermanageController ($scope,usermanageService) {

    var cellTemplate='<ui-button class="grid-btn primary-bg" icoclass="iconfont icon-shanchu"  ng-show="grid.appScope.showDisable(row)"  ng-click="grid.appScope.onDisabled(row)"   title="禁用"/>';
    cellTemplate +='<ui-button class="grid-btn primary-bg" icoclass="iconfont icon-yixuanze"   ng-show="grid.appScope.showEnable(row)"  ng-click="grid.appScope.onEnabled(row)"    title="启用"/>';


    var colModel=[
        { field: 'number',displayName: '序号', width: '5%', enableColumnMenu:false },
        { field: 'id',displayName: '操作', width: '5%', cellTemplate:cellTemplate ,enableColumnMenu:false },
        { field: 'login', displayName: '登入账号',type: 'text', width: '10%',cellTooltip: true ,enableColumnMenu:false },
        { field: 'name', displayName: '姓名' ,type: 'text',width: '10%', cellTooltip: true,enableColumnMenu:false },
        { field: 'email', displayName: '邮箱',type: 'text', width: '10%',cellTooltip: true,enableColumnMenu:false },
        { field: 'tenancyCode', displayName: '企业代号',type: 'text', width: '10%',cellTooltip: true,enableColumnMenu:false },
        { field: 'organization.name', displayName: '企业名称',type: 'text', width: '10%',cellTooltip: true,enableColumnMenu:false },
        { field: 'activated', displayName: '状态',type: 'text', cellFilter: 'format',  width: '10%',cellTooltip: true,enableColumnMenu:false }
        //{ field: 'phone', displayName: '手机',type: 'text', width: '8%',cellTooltip: true,enableColumnMenu:false },
        //{ field: 'birthday', displayName: '出生日期',type: 'text', width: '8%',cellTooltip: true,enableColumnMenu:false },
        //{ field: 'qqNum', displayName: 'QQ号码',type: 'text', width: '8%',cellTooltip: true,enableColumnMenu:false },
        //{ field: 'idCard', displayName: '身份证',type: 'text', width: '8%',cellTooltip: true,enableColumnMenu:false },
        //{ field: 'imageUrl', displayName: '头像地址',type: 'text', width: '10%',cellTooltip: true,enableColumnMenu:false },
        //{ field: 'userUrl', displayName: '路径',type: 'text', width: '5%',cellTooltip: true,enableColumnMenu:false }

    ];

    var paperTemplate = '<div role=\"contentinfo\" class=\"ui-grid-pager-panel\" ui-grid-pager ng-show=\"grid.options.enablePaginationControls\"><div role=\"navigation\" class=\"ui-grid-pager-container\"><span>共{{ paginationApi.getTotalPages() }}页/当前在<b>{{grid.options.paginationCurrentPage}}</b>页&nbsp;&nbsp;共{{grid.options.totalItems}}条<span></div><div class=\"ui-grid-pager-count-container\"> <div class=\"ui-grid-pager-count\"> <nav ng-show=\"grid.options.totalItems > 0\"> <ul class="pagination"> <li ng-class=\"{disabled:grid.options.paginationCurrentPage == 1}\"><a ng-click=\"pagePreviousPageClick()\" >&laquo;</a></li><li ng-class=\"{active:num == grid.options.paginationCurrentPage}\" ng-repeat=\"num in (paginationApi.getTotalPages() | pager:grid.options.paginationCurrentPage) track by $index"\"><a ng-click=\"paginationApi.seek(num)\">{{num}}</a></li><li ng-class=\"{disabled:grid.options.paginationCurrentPage == paginationApi.getTotalPages()}\"><a ng-click=\"pageLastPageClick()\">&raquo;</a></li></ul> </nav> </div> </div> </div>'
    var pageData = {
        page: 0,
        size: 15
    };
    $scope.gridOptions={
        columnDefs: colModel,
        paginationTemplate:paperTemplate,
        paginationPageSize: pageData.size,
        useExternalPagination: true,
        onRegisterApi : function(gridApi) {
            $scope.gridApi = gridApi;
            gridApi.pagination.on.paginationChanged($scope, function (pageNumber, pageSize) {
                pageData.page = pageNumber-1;
                pageData.size = pageSize;
                loadGridData(pageData);
            });
        }
    }
    loadGridData(pageData);

    function loadGridData(param){
        usermanageService.getAllUsers().then(function(response){
            var  data = response.data;
            $scope.gridOptions.totalItems = 3;
            var results=[];
            for(var i=0;i<data.content.length;i++){
                results.push($.extend({number:i+1+(pageData.page*pageData.size)},data.content[i],{}));
            }
            $scope.gridOptions.data=results;

        });
    }
    $scope.showEnable=function(row){
        return !row.entity.activated;
    }
    $scope.showDisable=function(row){
        return row.entity.activated;
    }
    $scope.onEnabled=function(row){
        usermanageService.setUserActivated({id:row.entity.id,activated:true}).then(function(response){
            loadGridData(pageData);
        });
    }
    $scope.onDisabled=function(row){
        usermanageService.setUserActivated({id:row.entity.id,activated:false}).then(function(response){
            loadGridData(pageData);
        });
    }
}
