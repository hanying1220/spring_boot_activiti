angular
    .module('erpApp')
    .controller('UiGridController', UiGridTreeController);

UiGridTreeController.$inject = ['$scope', '$http', '$timeout', '$interval', 'uiGridGroupingConstants'];

function UiGridTreeController($scope, $http, $timeout, $interval, uiGridGroupingConstants) {
    var data = [
        {
            id: 11,
            name: "角色管理",
            status: false,
            parent: {id: 1, name: "系统管理", status: false},
            actions: [{id: 111, name: "新增", flag: "add", status: false}, {id: 222,name: "删除",flag: "del",status: false}]
        },
        {
            id: 22,
            name: "菜单管理",
            status: false,
            parent: {id: 1, name: "系统管理", status: false},
            actions: [{id: 333, name: "新增", flag: "add", status: false}, {id: 444,name: "编辑",flag: "del",status: false}]
        }
    ];

    var cellTemplate2 = ' <div ng-show="!row.groupHeader">  ' +
        '<input type="checkbox" ng-checked="row.entity.status" ng-click="grid.appScope.clickCol2(row)" />{{row.entity.name}}' +
        '</div>';
    var cellTemplate3 = ' <div ng-show="!row.groupHeader" class="btn-group flex-btn-group-container" >  ' +
        '<span ng-repeat="item in row.entity.actions"><input type="checkbox" ng-checked="item.status" ng-click="grid.appScope.clickCol3(row,item.id)" />{{item.name}}</span>'
    '</div>';

    $scope.gridOptions = {
        enableSorting: false,
        enableFiltering: false,
        enableGroupHeaderSelection: true,
        columnDefs: [
            {
                field: 'parent.name', displayName: '一级菜单', grouping: {groupPriority: 0}, width: '20%',
                cellTemplate: '<div><div ng-if="row.groupHeader" class="ui-grid-cell-contents" title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div></div>'
            },
            {field: 'name', displayName: '二级菜单', cellTemplate: cellTemplate2, width: '20%', cellTooltip: true},
            {field: 'actions', displayName: '菜单动作', cellTemplate: cellTemplate3, width: '40%', cellTooltip: true}
        ],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };

    $scope.gridOptions.data = data;

    $scope.clickCol2=function(row){
        console.log('二级菜单：'+row.entity.id);
        angular.forEach(data, function(item){
            if(item.id == row.entity.id){
                item.ischange=true;
                item.status=!item.status;
                console.log(item.status);
                if(item.status==true){  //选中
                    item.parent.status=false;
                    angular.forEach(item.actions, function(opr){ //功能按钮选中
                        opr.status=true;
                    });
                }else{
                    item.parent.status=false;
                    angular.forEach(item.actions, function(opr){ //功能按钮取消
                        opr.status=false;
                    });
                }
            }
        });
        $scope.gridOptions.data=data;
    };
    $scope.clickCol3=function(row,oprid){
        console.log('菜单动作：'+row.entity.id+'['+oprid+']');
        angular.forEach(data, function(item){
            if(item.id == row.entity.id){
                item.ischange=true;
                angular.forEach(item.actions, function(opr){ //功能按钮取消
                    if(opr.id == oprid){
                        opr.status=!opr.status;
                        if(opr.status==true){
                            item.status=true;//二级
                            item.parent.status=true;//一级
                        }
                    }
                });
            }
        });
        $scope.gridOptions.data=data;
    };

};

