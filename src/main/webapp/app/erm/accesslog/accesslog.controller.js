angular
    .module('erpApp')
    .controller('AccesslogController', AccesslogController);

AccesslogController.$inject = ['$scope','$http','$state'];

function AccesslogController ($scope,$http,$state) {
    //var paperTemplate = '<div role=\"contentinfo\" class=\"ui-grid-pager-panel\"  style=\"height: 60px;line-height: 60px;\" ui-grid-pager ng-show=\"grid.options.enablePaginationControls\"><div role=\"navigation\" class=\"ui-grid-pager-container\"><span>共{{ paginationApi.getTotalPages() }}页/当前在<b>{{grid.options.paginationCurrentPage}}</b>页&nbsp;&nbsp;共{{grid.options.totalItems}}条<span></div><div class=\"ui-grid-pager-count-container\" style=\"height: 60px;line-height: 60px;\"> <div class=\"ui-grid-pager-count\" style=\"height: 60px;line-height: 60px;\"> <nav ng-show=\"grid.options.totalItems > 0\"> <ul class="pagination" style=\"margin: 15px;\"> <li ng-class=\"{disabled:grid.options.paginationCurrentPage == 1}\"><a ng-click=\"pagePreviousPageClick()\" >&laquo;</a></li><li ng-class=\"{active:num == grid.options.paginationCurrentPage}\" ng-repeat=\"num in (paginationApi.getTotalPages() | pager:grid.options.paginationCurrentPage) track by $index"\"><a ng-click=\"paginationApi.seek(num)\">{{num}}</a></li><li ng-class=\"{disabled:grid.options.paginationCurrentPage == paginationApi.getTotalPages()}\"><a ng-click=\"pageLastPageClick()\">&raquo;</a></li></ul> </nav> </div> </div> </div>';
    var paperTemplate = '<div role=\"contentinfo\" class=\"ui-grid-pager-panel\" ui-grid-pager ng-show=\"grid.options.enablePaginationControls\"><div role=\"navigation\" class=\"ui-grid-pager-container\"><span>共{{ paginationApi.getTotalPages() }}页/当前在<b>{{grid.options.paginationCurrentPage}}</b>页&nbsp;&nbsp;共{{grid.options.totalItems}}条<span></div><div class=\"ui-grid-pager-count-container\"> <div class=\"ui-grid-pager-count\"> <nav ng-show=\"grid.options.totalItems > 0\"> <ul class="pagination"> <li ng-class=\"{disabled:grid.options.paginationCurrentPage == 1}\"><a ng-click=\"pagePreviousPageClick()\" >&laquo;</a></li><li ng-class=\"{active:num == grid.options.paginationCurrentPage}\" ng-repeat=\"num in (paginationApi.getTotalPages() | pager:grid.options.paginationCurrentPage) track by $index"\"><a ng-click=\"paginationApi.seek(num)\">{{num}}</a></li><li ng-class=\"{disabled:grid.options.paginationCurrentPage == paginationApi.getTotalPages()}\"><a ng-click=\"pageLastPageClick()\">&raquo;</a></li></ul> </nav> </div> </div> </div>'

    var colModel=[
        {field: 'number',displayName: '序号', width: '25%', enableColumnMenu:false},
        { field: 'id', displayName: 'id',type: 'text', width: '20%',cellTooltip: true, visible:false,enableColumnMenu:false },
        { field: 'principal', displayName: '登入账号',type: 'text', width: '25%',cellTooltip: true,enableColumnMenu:false },
        { field: 'auditEventDate', displayName: '时间',type: 'text', width: '25%',cellTooltip: true,enableColumnMenu:false },
        { field: 'auditEventType', displayName: '状态',type: 'text', width: '25%',cellTooltip: true,enableColumnMenu:false }
    ];


    var pageData = {
        page: 0,
        size: 20
    };

    $scope.gridOptions={
        columnDefs: colModel,
        paginationPageSizes: [5,30,40,50],
        paginationTemplate:paperTemplate,
        paginationPageSize: pageData.size,
        useExternalPagination: true,
        onRegisterApi : function(gridApi) {
            $scope.gridApi= gridApi;
            gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                pageData.page = newPage-1;
                pageData.size = pageSize;
                loadGridData(pageData);
            });
        }
    }

    loadGridData(pageData);

    function loadGridData(pageData){
        var result =  $http({
            url:'/api/log/findAllAccess',
            method:'GET',
            params:pageData
        });
        result.then(function(response){
            $scope.gridOptions.data=response.data;
            $scope.gridOptions.paginationCurrentPage=pageData.page+1;
            $scope.gridOptions.totalItems = response.data.totalElements;
            var acccesLog=[];
            var data=response.data;
            for(var i=0;i< data.content.length;i++){
                acccesLog.push($.extend({number:i+1+(pageData.page*pageData.size)},data.content[i],{}));
            }
            $scope.gridOptions.data=acccesLog;
        })
    }


}
