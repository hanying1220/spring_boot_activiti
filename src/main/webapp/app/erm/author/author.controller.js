angular
    .module('erpApp')
    .controller('AuthorController', AuthorController)
    .filter('statusFilter', function() {
        return function (input) {
            if (!input) {
                return '否';
            } else {
                return '是';
            }
        };
    });
AuthorController.$inject = ['$scope','$http','layer','Principal'];

function AuthorController ($scope,$http,layer,Principal) {
    //全局变量
    $scope.roleId=0;
    $scope.menuId=0;
    //判断是否是ROLE_SYS_ADMIN
    $scope.isTenantAdmin = Principal.isTenantAdminAuthority();

    /**************角色列表******************/
    var colRole=[
        { field: 'number', displayName: '序号',width: '20%',cellTooltip: true},
        { field: 'name', displayName: '名称',width: '30%',cellTooltip: true},
        { field: 'describe', displayName: '描述',width: '55%',cellTooltip: true}
    ];
    //角色管理列表
    $scope.roleGrid={
        columnDefs: colRole,
        enableColumnMenus:false,
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect:false,
        noUnselect:true,
        onRegisterApi : function(gridApi) {
            $scope.roleGridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope,function(row){
                //console.log(row);
                var roleId=row.entity.id;
                $scope.roleId=roleId;
                loadMenuData(roleId);
                loadPermissionData(roleId);
            });
        }
    };
    //加载角色列表
    roleLoad();

    //搜索
    $scope.searchFun=function(){
        roleLoad();
    };


    /**************菜单动作列表******************/
    $scope.roleMenuChange=false;//菜单动作是否更改
    var gridData=[
        //{id:11,name:"角色管理",status:false,parent:{id:1,name:"系统管理",status:false},actions:[{id:111,name:"新增",flag:"add",status:false},{id:222,name:"删除",flag:"del",status:false}]}
    ];

    //测试数据
    //for(var i=0;i<30;i++){
    //    var pid=i+1;
    //    var id=100*pid;
    //    var cid1=10*id,cid2=cid1+1;
    //    gridData.push({id:id,name:"角色管理"+id,status:false,parent:{id:pid,name:"系统管理"+pid,status:false},actions:[{id:cid1,name:"新增"+cid1,flag:"add",status:false},{id:cid2,name:"删除"+cid2,flag:"del",status:false}]});
    //}

    var cellTemplate2 = ' <div ng-show="!row.groupHeader">  ' +
        '<input type="checkbox" ng-checked="row.entity.status" ng-click="grid.appScope.clickCol2(row)" />{{row.entity.name}}' +
        '</div>';
    var cellTemplate3 = ' <div ng-show="!row.groupHeader" class="btn-group flex-btn-group-container" >  ' +
        '<span ng-repeat="item in row.entity.actions"><input type="checkbox" ng-checked="item.status" ng-click="grid.appScope.clickCol3(row,item.id)" />{{item.name}}</span>'
    '</div>';

    $scope.gridOptions = {
        enableSorting: false,
        enableColumnMenus:false,
        enableFiltering: false,
        enableGroupHeaderSelection: true,
        columnDefs: [
            {
                field: 'parent.name', displayName: '一级菜单', grouping: {groupPriority: 0}, width: '20%',
                cellTemplate: '<div ng-show="row.groupHeader" class="ui-grid-cell-contents">{{COL_FIELD}}</div>'
            },
            {field: 'name', displayName: '二级菜单', cellTemplate: cellTemplate2, width: '30%', cellTooltip: true},
            {field: 'actions', displayName: '菜单动作', cellTemplate: cellTemplate3, width: '50%', cellTooltip: true}
        ],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };

    $scope.clickCol2=function(row){
        //console.log('二级菜单：'+row.entity.id);
        $scope.roleMenuChange=true;
        angular.forEach(gridData, function(item){
            if(item.id == row.entity.id){
                item.ischange=true;
                item.status=!item.status;
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
        $scope.gridOptions.data=gridData;
    };
    $scope.clickCol3=function(row,oprid){
        //console.log('菜单动作：'+row.entity.id+'['+oprid+']');
        $scope.roleMenuChange=true;
        angular.forEach(gridData, function(item){
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
        $scope.gridOptions.data=gridData;
    };

    //保存菜单动作
    $scope.saveRoleMenu=function(){
        if(!$scope.roleMenuChange){
            showMsg('未做任何更改');
            return false;
        }

        var data=[];
        angular.forEach(gridData, function(item){
            if(item.ischange){
                data.push(item);
            }
        });

        $http({
            url:'/api/auth/saveRoleMenu',
            params:{
                jsondata:JSON.stringify(data)
            },
            method:'post'
        }).success(function(data,header,config,status){
            angular.forEach(gridData, function(item){
                item.ischange=false;
            });
            $scope.roleMenuChange=false;
            layer.alert('保存成功');
        }).error(function(data,header,config,status){

        });
    };
    //取消菜单动作
    $scope.cancelRoleMenu=function(){
        if(!$scope.roleMenuChange){
            showMsg('未做任何更改');
            return false;
        }
        loadMenuData($scope.roleId);
        $scope.roleMenuChange=false;
    };



    /**************菜单权限列表******************/
    var permissionCols=[
        { field: 'number',displayName: '序号', width: '10%'},
        { field: 'parentName', displayName: '上级类型',width: '30%',cellTooltip: true},
        { field: 'name', displayName: '数据类型',width: '30%',cellTooltip: true},
        { field: 'status', displayName: '是否配置权限',cellFilter:'statusFilter',cellClass:'red', width: '30%',cellTooltip: true}
    ];

    $scope.permissionGrid = {
        enableColumnMenus:false,
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect:false,
        noUnselect:true,
        columnDefs: permissionCols,
        //data:[{id:1,name:"aaa",status:true}],
        onRegisterApi: function( gridApi ) {
            //解决宽度不渲染问题
            gridApi.grid.element.width($scope.gridApi.grid.element.width());
            $scope.permissionGridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope,function(row){
                $scope.menuId=row.entity.id;
            });
        }
    };

    /***********弹出框***************/
    $scope.permissionTree={};
    var mydata=[];
    $scope.permissionData=[];
    var delUserData=[];
    //初始化树
    function initTree(){
        $http({
            url:'/api/OrgzfindAll',
            method:'GET',
            params:null
        }).success(function(data,header,config,status){
            angular.forEach(data, function(item){
                item.closed=true;
                item.expanded=false;
                item.selected=false;
            });
            mydata=data;
            //$scope.treeData=mydata;
        }).error(function(data,header,config,status){

        });
    }
    initTree();

    //配置权限
    $scope.configPermission=function(){
        if($scope.roleId==0){
            showMsg('请选择角色');
            return false;
        }
        if($scope.menuId==0){
            showMsg('请选择要配置的菜单');
            return false;
        }
        //console.log($scope.roleId+'/'+$scope.menuId);
        //获取角色菜单权限
        getPermissions();

        delUserData=[];
        angular.forEach(mydata, function(item){
            item.closed=true;
            item.expanded=false;
            item.selected=false;
        });
        $scope.treeData=mydata;
        $scope.dialog=layer.open({
            type: 1,
            title:  '配置权限',
            area   : ['500px', '500px'],
            resize:false,
            contentUrl: 'app/erm/author/permission-dialog.html',
            scope:$scope,
            cancel:function(index){
                $scope.permissionTree.destroy();
                layer.close(index);
            }
        });
    };
    function getPermissions(){
        $http({
            url:'/api/auth/findRolePermissions',
            method:'get',
            params:{
                roleId:$scope.roleId,
                menuId:$scope.menuId
            }
        }).success(function(data){
            $scope.permissionData=data;
        });
    }

    // 节点展开前
    $scope.beforeExpand = function (node) {
        //console.log('展开前',node);
        if(!node.expanded){
            var orgId=node['id'];
            $http({
                url:'/api/auth/findPermissionUser',
                method:'get',
                params:{
                    orgId:orgId
                }
            }).success(function(data){
                angular.forEach($scope.permissionData, function(item){
                    angular.forEach(data, function(user){
                        if(item==user.id){
                            user.selected=true;
                        }
                    });
                });
                $scope.permissionTree.append(data,node);
                node.expanded=true;
            });
        }
    };

    //选中
    $scope.selectUser = function (node) {
        //console.log('selectUser');
        if(node.id.indexOf('user_')>=0){
            var userId=Number(node.id.substring(5));
            var idx=delUserData.indexOf(userId);
            if(idx>=0){
                delUserData.splice(idx,1);
            }
        }
    };
    //取消选中
    $scope.cancelSelectUser = function (node) {
        //console.log('cancelSelectUser');
        angular.forEach($scope.permissionData, function(item){
            if(item==node.id){
                var userId=Number(node.id.substring(5));
                if(delUserData.indexOf(userId)<0){
                    delUserData.push(userId);
                }
            }
        });
    };

    //延迟加载
    $scope.loadBranch = function(node, success, error){
        debugger;
        var orgId=node['id'];
        $http({
            url:'/api/auth/findPermissionUser',
            method:'get',
            params:{
                orgId:orgId
            }
        }).success(function(data){
            //angular.forEach(data, function(item){
            //    item.selected=true;
            //});
            success(data);
        });
    };

    //关闭弹出框
    $scope.closePer=function(){
        $scope.permissionTree.destroy();
        layer.close($scope.dialog);
    };
    //保存菜单权限
    $scope.savePer=function(){
        var users=[];
        var data=$scope.permissionTree.getSelected();
        angular.forEach(data, function(item){
            var userid=''+item.id;
            if(userid.indexOf('user_')>=0){
                users.push(Number(userid.substring(5)));
            }
        });
        //console.log(users);
        $http({
            url:'/api/auth/saveRolePermission',
            params:{
                roleId:$scope.roleId,
                menuId:$scope.menuId,
                jsondata:JSON.stringify(users),
                deldata:JSON.stringify(delUserData)
            },
            method:'post'
        }).success(function(data,header,config,status){
            $scope.permissionTree.destroy();
            layer.alert('保存成功',function(){
                layer.closeAll();
            });

        }).error(function(data,header,config,status){

        });
    };



    //角色首次加载数据
    function roleLoad(){
        $http({
            url:'/api/auth/findAllRole',
            method:'get',
            params:{
                name:$('#name').val()
            }
        }).success(function(data){
            angular.forEach(data, function(item,index){
                item.number=index+1;
            });
            $scope.roleGrid.data = data;
            $scope.gridOptions.data=[];
            $scope.permissionGrid.data=[];
            $scope.roleMenuChange=false;
        });
    }

    //通过角色查询菜单及动作
    function  loadMenuData(roleId){
        //console.log('roleId='+roleId);
        $http({
            url:'/api/auth/findAllRoleMenu',
            params:{
                roleId:roleId
            },
            method:'get'
        }).success(function(data1,header,config,status){
            //console.log(data1);
            gridData=data1;
            $scope.gridOptions.data=gridData;
        }).error(function(data,header,config,status){

        });
    }
    //通过角色查询菜单及权限
    function  loadPermissionData(roleId){
        //console.log('roleId='+roleId);
        $http({
            url:'/api/auth/findAllRolePermission',
            params:{
                roleId:roleId
            },
            method:'get'
        }).success(function(data,header,config,status){
            //console.log(data);
            angular.forEach(data, function(item,index){
                item.number=index+1;
            });
            $scope.permissionGrid.data=data;
        }).error(function(data,header,config,status){

        });
    }

    //提示消息
    function showMsg(content){
        layer.msg(content,{icon: 5});
    }
}
