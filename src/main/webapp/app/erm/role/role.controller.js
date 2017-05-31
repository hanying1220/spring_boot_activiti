var erpApp =angular.module('erpApp');
   erpApp.controller('RoleController', RoleController);

RoleController.$inject = ['$scope','wiAlert','$http','wiMessageTip','RoleService','layer'];

function RoleController ($scope,wiAlert,$http,wiMessageTip,RoleService,layer) {
    var cellRoleTemplate='<ui-button class="grid-btn primary-bg" icoclass="iconfont icon-bianji" ng-click="grid.appScope.editRole(row)"   title="编辑" permission-code="edit" ng-disabled="grid.appScope.isDisable" />' +
        '<ui-button class="grid-btn danger-bg" icoclass="iconfont icon-shanchu" ng-click="grid.appScope.removeRole(row)" title="删除" permission-code="delete" ng-disabled="grid.appScope.isDisable"  />';
    var paperTemplate = '<div role=\"contentinfo\" class=\"ui-grid-pager-panel\"  style=\"height: 60px;line-height: 60px;\" ui-grid-pager ng-show=\"grid.options.enablePaginationControls\"><div role=\"navigation\" class=\"ui-grid-pager-container\"><span>共{{ paginationApi.getTotalPages() }}页/当前在<b>{{grid.options.paginationCurrentPage}}</b>页&nbsp;&nbsp;共{{grid.options.totalItems}}条<span></div><div class=\"ui-grid-pager-count-container\" style=\"height: 60px;line-height: 60px;\"> <div class=\"ui-grid-pager-count\" style=\"height: 60px;line-height: 60px;\"> <nav ng-show=\"grid.options.totalItems > 0\"> <ul class="pagination" style=\"margin: 15px;\"> <li ng-class=\"{disabled:grid.options.paginationCurrentPage == 1}\"><a ng-click=\"pagePreviousPageClick()\" >&laquo;</a></li><li ng-class=\"{active:num == grid.options.paginationCurrentPage}\" ng-repeat=\"num in (paginationApi.getTotalPages() | pager:grid.options.paginationCurrentPage) track by $index"\"><a ng-click=\"paginationApi.seek(num)\">{{num}}</a></li><li ng-class=\"{disabled:grid.options.paginationCurrentPage == paginationApi.getTotalPages()}\"><a ng-click=\"pageLastPageClick()\">&raquo;</a></li></ul> </nav> </div> </div> </div>'
    var cellTemplate01='<b>{{row.entity.activated|format}}</b>';
    var colRole=[
        {field: 'number',displayName: '序号', width: '20%', enableColumnMenu:false},
        { field: 'id',displayName: '操作', width: '30%', cellTemplate:cellRoleTemplate ,enableColumnMenu:false },
        { field: 'name', displayName: '名称',type: 'text', width: '20%',cellTooltip: true,enableColumnMenu:false },
        { field: 'describe', displayName: '描述',type: 'text', width: '35%',cellTooltip: true,enableColumnMenu:false }
    ];
    var colUser=[
        {field: 'number',displayName: '序号', width: '15%', enableColumnMenu:false},
        { field: 'id', width: '25%',  display:'none',visible:false, enableColumnMenu:true },
        { field: 'code', displayName: '编号',type: 'text', width: '20%',cellTooltip: true ,enableColumnMenu:false },
        { field: 'name', displayName: '名称',type: 'text', width: '25%',cellTooltip: true,enableColumnMenu:false },
        { field: 'userUrl', displayName: '路径',type: 'text', width: '40%',cellTooltip: true,enableColumnMenu:false }
    ];
    var colModel=[
        {field: 'number',displayName: '序号', width: '10%', enableColumnMenu:false},
        { field: 'id',displayName: '操作', width: '20%'  ,visible:false,enableColumnMenu:false },
        { field: 'code', displayName: '编号',type: 'text', width: '20%',cellTooltip: true ,enableColumnMenu:false },
        { field: 'name', displayName: '名称',type: 'text', width: '20%',cellTooltip: true,enableColumnMenu:false },
        { field: 'activated', displayName: '状态',type: 'text', width: '20%',cellTooltip: true,cellTemplate:cellTemplate01,enableColumnMenu:false },
        { field: 'userUrl', displayName: '路径' ,type: 'text',width: '30%', cellTooltip: true,enableColumnMenu:false }
    ];
    $scope.orgzTree={};
    $scope.orgz={};
    $scope.userList=[];
    $scope.deleteuserList=[];//角色用户删除列表
    $scope.roleUserDisable=true;
    $scope.roleDisable=true;
    $scope.search={};
    //定义声明
    var vm = $scope.vm = {
        htmlSource: "",
        showErrorType: "1",
        showDynamicElement: true,
        dynamicName: "dynamicName",
        role: {}
    };
    vm.validateOptions = {
        blurTrig: true,//光标移除元素后是否验证并显示错误提示信息
        showError  : true, // 显示错误信息
        removeError: true  // 验证通过后在元素的后面移除错误信息
    };
    var pageData = {
        page: 0,
        size: 5
    };

    $scope.roleMykey = function (e) {
        var keycode = window.event ? e.keyCode : e.which;//获取按键编码
        if (keycode == 13) {
            $scope.searchRole();
        }
    }
    $scope.roleUserMykey = function (e) {
        var keycode = window.event ? e.keyCode : e.which;//获取按键编码
        if (keycode == 13) {
            $scope.searchFun();
        }
    }

    //弹出确认框
    var confirmDialog=function(content, options, yes, cancel){
        return layer.confirm(content, options, yes,cancel);
    };
    //弹出消息框
    var warnDialog=function(text,icon){
        return layer.msg(text, {icon: icon});
    };
    initTreeData();
    //角色加载
    roleLoad();
    //初始化树
    function initTreeData(){
        $http({
            url:'/api/OrgzfindAll',
            method:'GET',
            params:null
        }).success(function(data,header,config,status){
            $scope.treeData=data;
        }).error(function(data,header,config,status){
        });
    }
    // 点击树节点的回调方法
    $scope.onitemclick=function(node){
        $scope.selectNode=node;
        pageData.page=0;
        loadGridData(pageData,node);
        $scope.gridApi.selection.clearSelectedRows();
    }

    //角色管理列表
    $scope.roleGrid={
        data:[],
        columnDefs: colRole,
        enableSelectionBatchEvent : true,
        multiSelect: false ,
        enableVerticalScrollbar : 1, //grid垂直滚动条是否显示, 0-不显示  1-显示*/
        enableHorizontalScrollbar :  1, //grid水平滚动条是否显示, 0-不显示  1-显示
        enableRowHeaderSelection : false, //是否显示选中checkbox框 ,默认为true
        enableRowSelection: true,
        onRegisterApi : function(gridApi) {
            $scope.gridApiRole = gridApi;
       //行选中事件
            $scope.gridApiRole.selection.on.rowSelectionChanged($scope,function(row,event){
                if(row){
                    userLoad(row.entity.id);
                    $scope.roleSelected = row.entity;
                    $scope.gridApiUser.selection.clearSelectedRows();
                }
            });
        }
    };

    //用户管理列表
    $scope.userGrid={
        columnDefs: colUser,
        onRegisterApi : function(gridApi) {
            $scope.gridApiUser = gridApi;
        }
    };

    //获取权限列表中的用户
    $scope.gridOptions={
       /* data:$scope.MyData,*/
        paginationPageSizes: [5,30,40,50],
        paginationTemplate:paperTemplate,
        paginationPageSize: 5,
        useExternalPagination: true,
        columnDefs: colModel,
        //showTreeExpandNoChildren:false,
        onRegisterApi : function(gridApi) {
            $scope.gridApi= gridApi;
            gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                pageData.page = newPage-1;
                pageData.size = pageSize;
                loadGridData(pageData,$scope.selectNode);
            });
        }
    };

    //新增角色弹框
    $scope.addRole=function(modfiy){
        if(modfiy=="add") {
            //先清空 后增加修改字段
           $scope.vm.role = {};
           $scope.vm.role.modfiy = "add";
        }
        var area=['500px', 'auto'];
        $scope.roleLog=layer.open({
            type: 1,
            title:  '新增角色',
            area   : area,
            contentUrl: 'app/erm/role/addRole.html',
            scope:$scope,
            resize:false
        });
    }

    //保存角色
    $scope.saveRole=function(){
       var  params=$scope.vm.role;
        if( $scope.vm.role.modfiy == "add"){
            $http({
                params:params,
                url:'/api/saveRole',
                method:'post'
            }).success(function(data,header,config,status){
                data.number=($scope.roleGrid.data!=null?$scope.roleGrid.data.length:0)+1;
                $scope.roleGrid.data=$scope.roleGrid.data!=null?$scope.roleGrid.data:[];
                $scope.roleGrid.data.push(data);
                $scope.roleDisable=false;
                layer.close($scope.roleLog);
            }).error(function(data,header,config,status){
                warnDialog("服务器网络异常",5);
            });
        }else{
            $http({
                params:params,
                url:'/api/saveRole',
                method:'post'
            }).success(function(data,header,config,status){
               //$scope.roleGrid.data.update($scope.roleSelected,data);
                roleLoad();
                $scope.roleSelected = null;
                layer.close($scope.roleLog);
            }).error(function(data,header,config,status){
               warnDialog("服务器网络异常",5);
            });


        }
    };

   //编辑角色弹框
    $scope.editRole=function(row){
        $scope.gridApiRole.selection.clearSelectedRows();
        //该行被选中
        $scope.gridApiRole.selection.toggleRowSelection(row);
        userLoad(row.entity.id);
        vm.role=$.extend({},{},row.entity);
        $scope.vm.role= vm.role;
        $scope.vm.role.modfiy = "edit";
        userLoad(row.entity.id);
        $scope.roleLog=layer.open({
            type: 1,
            title:  '编辑角色',
            area   : ['500px', 'auto'],
            contentUrl: 'app/erm/role/addRole.html',
            scope:$scope,
            resize:false,
        });
    }

    //角色移除
    $scope.removeRole=function(row) {
        //该行被选中
        $scope.gridApiRole.selection.clearSelectedRows();
        $scope.gridApiRole.selection.toggleRowSelection(row);
        userLoad(row.entity.id);
        confirmDialog("确定要删除【" + row.entity.name + "】角色吗？",
        {icon: 3, title: '提示'},
            function () {
                $http({
                    url: '/api/userInfo/findByRole',
                    method: 'GET',
                    params: {roleId: row.entity.id}
                }).success(function (data, header, config, status) {
                    if (data.length > 0) {
                        warnDialog("角色已关联用户，无法删除 ", 5);
                    }
                    else {
                        var params = {id: row.entity.id};
                        var index = $scope.roleGrid.data.indexOf(row.entity);
                        $http({
                            params: params,
                            url: '/api/deleteRole',
                            method: 'get'
                        }).success(function (data, header, config, status) {
                            $scope.roleGrid.data.splice(index, 1);
                            roleLoad();
                            $scope.roleSelected = null;
                            warnDialog("操作成功 ", 6);
                        }).error(function (data, header, config, status) {
                            warnDialog("服务器网络异常", 5);
                        });
                    }
                });
            }
        )

    }

    //角色搜索
    $scope.searchRole=function(){
        $http({
            params:{name:$scope.search.roleSearch},
            url:'/api/searchRole',
            method:'get'
        }).success(function(data,header,config,status){
            $scope.roleGrid.data=roleDataResolve(data);
            $scope.userGrid.data=[];
            $scope.gridApiUser.selection.clearSelectedRows();
            layer.close($scope.userLog);
        }).error(function(data,header,config,status){
            warnDialog("服务器网络异常",5);
        });
    }

    //关闭用户列表弹框
    $scope.userClose=function(){
        layer.close($scope.userLog);
    }
    //新增用户
    $scope.addUser=function(){
        //判断角色是否被选中
      if($scope.roleSelected) {
           $scope.userLog=layer.open({
               type: 1,
               title:  '新增用户',
               area   : ['900px', '650px'],
               resize:false,
               contentUrl: 'app/erm/role/addUser.html',
               scope:$scope
           });
          if($scope.orgzTree.loadData){
              $scope.orgzTree.loadData([]);
          }
          initTreeData();
       }else{
           warnDialog("请选择左边的角色列表",1);
       }
   }

    //将弹框的用户加到列表中
    $scope.addUserList=function(){
        var user=[];
        angular.forEach($scope.gridApi.selection.getSelectedRows(), function (item) {
            user.push(item.id);
        });
        if(user.length>0&&$scope.roleSelected.id!=null){
            var params={userId:user,roleId:$scope.roleSelected.id};
            $http({
                params:params,
                url:'/api/saveRoleUserList',
                method:'post'
            }).success(function(data,header,config,status){
                    userGridAddData(data);
                layer.close($scope.userLog);
            }).error(function(data,header,config,status){
                warnDialog("服务器网络异常",5);
            });
        }
        else{
            warnDialog("请选择一条记录",5);
        }
    }

    //用户批量删除
    $scope.deleteUserList=function(){
        confirmDialog("是否删除选中用户?",
            {icon: 3, title: '提示'},
            function () {
                 var deleteuserList=$scope.gridApiUser.selection.getSelectedRows();
                 if(deleteuserList.length>0){
                 var roleUserList=[];
                 angular.forEach(deleteuserList, function (item) {
                    var index = $scope.userGrid.data.indexOf(item);
                    roleUserList.push(item.id);
                    $scope.userGrid.data.splice(index,1);
                 });
                   userDataRemove(roleUserList);
                 }
                else{
                     warnDialog("请至少选择一条数据",5);
                 }
            })
    }

    //用户搜索
    $scope.searchFun=function(){
        var roleId= $scope.roleSelected.id;
        if(roleId){
            $http({
                params:{name:$scope.search.userName,roleId:roleId},
                url:'/api/searchRoleUser',
                method:'get'
            }).success(function(data,header,config,status){
                $scope.userGrid.data=roleUserDataResolve(data);
            }).error(function(data,header,config,status){
                warnDialog("服务器网络异常",5);
            });
        }
        else{
            $scope.userGrid.data=[];
        }

    }

    $scope.roleClose=function(){
        layer.close($scope.roleLog);
    }

    //弹框用户列表
    var loadGridData=function(pageData,data){
        if(data){
            pageData.orgzId=data.id;
        }
        $http({
            url:'/api/userInfo/findAll',
            method:'GET',
            params:pageData
        }).success(function(data,header,config,status){
            $scope.gridOptions.paginationCurrentPage=pageData.page+1;
            $scope.gridOptions.totalItems = data.totalElements;
            var user=[];
            for(var i=0;i<data.content.length;i++){
                data.content[i].code=(data.content[i].code==null||data.content[i].code=="")?"暂无":data.content[i].code;
                user.push($.extend({number:i+1+(pageData.page*pageData.size)},data.content[i],{}));
            }
            $scope.gridOptions.data=user;
        }).error(function(data,header,config,status){
            warnDialog("服务器网络异常",5);
        });
    };

    //角色首次加载数据
    function  roleLoad(){
        $http.get('/api/RolefindAll')
            .success(function(data) {
                if(data.length>0){
                    $scope.roleDisable=false;
                    $scope.roleGrid.data = roleDataResolve(data);
                }
                else{
                    $scope.roleDisable=true;
                    $scope.roleGrid.data =null;
                }
        });

    }

    //用户加载数据
    function  userLoad(roleId){
        if(roleId){
            var params={roleId:roleId};
            $http({
                url:'/api/userInfo/findByRole',
                method:'GET',
                params:params
            }).success(function(data,header,config,status){
                $scope.roleUserDisable=data.length>0?false:true;//批量删除是否启用
                $scope.userGrid.data=roleUserDataResolve(data);
            }).error(function(data,header,config,status){
                warnDialog("服务器网络异常",5);
            });
        }
        else{
            $scope.userGrid.data=[];
        }
    }

    //用户数据添加
    function  userGridAddData(data){
        if(data.length>0){
            $scope.roleUserDisable=false;
            var i=$scope.userGrid.data.length+1;
            angular.forEach(data, function (item) {
                var user={
                    number:i,
                    id:item.id,
                    code: (item.user.code==null ||item.user.code=="")? "暂无" : item.user.code ,
                    name:item.user.name,
                    userUrl:item.user.userUrl
                }
                $scope.userGrid.data.push(user);
                i++;
            });
        }
    }

    //用户数据移除
    function  userDataRemove(roleUserList){
       var  params={roleUserList:roleUserList}
         $http({
         url:'/api/deleteRoleUser',
         method:'GET',
         params:params
         }).success(function(data,header,config,status){
             userLoad($scope.roleSelected.id);
             warnDialog("删除成功",6);
         }).error(function(data,header,config,status){
             warnDialog("服务器网络异常",5);
         });
    }

    //弹框用户数据处理
    function userDataResolve(data){
        var userlist=[];
        var i=1;
        angular.forEach(data, function (item) {
            var user={
                number:i,
                id:item.id,
                code: (item.code==null ||item.code=="")? "暂无" : item.code ,
                name:item.name,
                userUrl:item.userUrl
            }
            userlist.push(user);
            i++;
        });
        return userlist;

    }

    //角色数据处理
    function  roleDataResolve(data){
        var i=1;
        var rolelist=[];
        angular.forEach(data, function (item) {
            var role={
                number:i,
                id:item.id,
                describe: item.describe==null ? "暂无" : item.describe ,
                name:item.name
            }
            i++;
            rolelist.push(role);
        });
        return rolelist;
    }

    //角色用户数据处理
    function roleUserDataResolve(data) {
        var roleUserlist = [];
        var i = 1;
        $scope.userGrid.data = null;
        angular.forEach(data, function (item) {
            var roleUser = {
                number: i,
                id: item.id,
                code: (item.user.code == null||item.user.code=="")? "暂无" : item.user.code,
                name: item.user.name,
                userUrl: item.user.userUrl
            }
            roleUserlist.push(roleUser);
            i++;
        });
        return roleUserlist;
    }

}

