(function() {
    'use strict';
   var app= angular.module('erpApp').controller('OrganizationController', OrganizationController);
    app.filter('iconChange', function () {
        return function (input) {
            if (input) {
                return "iconfont icon-jinyong"
            }else{
                return "iconfont icon-yixuanze"
            }
        }
    });
    app.filter('format', function () {
        return function (input) {
            if (input) {
                return "可用";
            }else{
                return "禁用";
            }
        }
    });

    app.filter('titleChange', function () {
        return function (input) {
            if (input) {
                return "禁用";
            }else{
                return "启用";
            }
        }
    });
    app.filter('formatDate', function () {
        return function (input) {
            if (input) {
                return new Date(input);
            }else{
                return null;
            }
        }
    });
    OrganizationController.$inject = ['$scope','OrganizationService','$http','layer'];

    function OrganizationController ($scope,OrganizationService,$http,layer) {
        $scope.birthday = new Date();
        $scope.format = "yyyy-MM-dd";
        $scope.altInputFormats = ['yyyy/M!/d!'];

        $scope.popup = {
            opened: false
        };
        $scope.open = function () {
            $scope.popup.opened = true;
        };
        var pageData = {
            page: 0,
            size: 5,
        };
        $scope.search={};
        $scope.orgz={};
        $scope.orgzTree={};
        // 组织机构类型
        $scope.orgzTypes = [{value: 1, text: "公司"}, {value: 2, text: "部门"}];
        //弹出确认框
        var confirmDialog=function(content, options, yes, cancel){
            return layer.confirm(content, options, yes,cancel);
        };

        //弹出消息框
        var warnDialog=function(text,icon){
            return layer.msg(text, {icon: icon});
        };
        //获取树的根节点
        var getRootNode=function(){
            if($scope.orgzTree.getNodes("parentId",null).length>0){
                return $scope.orgzTree.getNodes("parentId",null)[0];
            }else{
                return null;
            }
        }
        //搜索
        $scope.searchUser=function(){
            pageData.page=0;
            loadGridData(pageData,$scope.selectNode,$scope.search.searchName);
        }
        //刷新列表
        var loadGridData=function(pageData,node,searchName){
            if(node){
                pageData.orgzId=node.id;
            }
            pageData.searchName=searchName;
            $http({
                url:'/api/userInfo/findAll',
                method:'GET',
                params:pageData
            }).success(function(data,header,config,status){
                $scope.gridOptions.paginationCurrentPage=pageData.page+1;
                $scope.gridOptions.totalItems = data.totalElements;
                var orgz=[];
                for(var i=0;i<data.content.length;i++){
                    orgz.push($.extend({number:i+1+(pageData.page*pageData.size)},data.content[i],{}));
                }
                $scope.gridOptions.data=orgz;
            }).error(function(data,header,config,status){

            });
        };

        // 点击树节点的回调方法
        $scope.onitemclick=function(node){
            $scope.selectNode=node;
            pageData.page=0;
            loadGridData(pageData,node);
        }
        //初始化树
        $scope.init=function(){
            $http({
                url:'/api/OrgzfindAll',
                method:'GET',
                params:null
            }).success(function(data,header,config,status){
                $scope.treeData=data;
            }).error(function(data,header,config,status){

            });
        }
        $scope.init();
        //关闭编辑树的弹框
        $scope.closeLayer= function () {
            layer.close($scope.dailog);
        }
        //添加，编辑树弹框
        $scope.showOrgz=function (modfiy){
            if(modfiy=="add"){
                //先清空 后增加修改字段
                $scope.orgz={}
                $scope.orgz.modfiy="add";
                if($scope.selectNode){
                    $scope.orgz.orgzUrl=($scope.selectNode.orgzUrl?$scope.selectNode.orgzUrl:"")+($scope.selectNode.name?$scope.selectNode.name:"")+"/";
                }else{
                    if(getRootNode()){
                        $scope.orgz.orgzUrl=(getRootNode().orgzUrl?getRootNode().orgzUrl:"")+(getRootNode().name?getRootNode().name:"")+"/";
                    }
                }
            }else if(modfiy=="update"){
                if($scope.selectNode){
                    $scope.orgz={
                        code: $scope.selectNode.code,
                        fullName: $scope.selectNode.fullName,
                        id: $scope.selectNode.id,
                        isParent: $scope.selectNode.isParent,
                        modfiy: "update",
                        name: $scope.selectNode.name,
                        orgzUrl: $scope.selectNode.orgzUrl,
                        parentId: $scope.selectNode.parentId,
                        orgzType:$scope.selectNode.orgzType
                    }
                }else{
                    warnDialog("请选择节点后再编辑",5);
                    return true;
                }
            }
            $scope.dailog=layer.open({
                type   : 1,
                title:'新增组织机构',
                contentUrl: 'app/erm/organization/dialog/orgSaveDialog.html',
                area:["680px","280px"],
                scope:$scope,
                resize:false,
            });
        };

        //添加，编辑树的保存方法
        $scope.saveOrgz=function(){
            if($scope.orgz.orgzType==1){
                $scope.orgz.cls="iconfont icon-gongsi";
            }else if($scope.orgz.orgzType==2){
                $scope.orgz.cls="iconfont icon-msnui-org";
            }
            if($scope.orgz.modfiy=="add"){
                if($scope.selectNode){
                    $scope.orgz.parentId=$scope.selectNode.id
                }else{
                    if(getRootNode()){
                        $scope.orgz.parentId=getRootNode().id;
                    }
                }
                $http({
                    params:$scope.orgz,
                    url:'/api/saveOrgz',
                    method:'post'
                }).success(function(data,header,config,status){
                    $scope.closeLayer();
                    if($scope.selectNode){
                        $scope.orgzTree.append([data],$scope.selectNode);
                    }else{
                         $scope.orgzTree.append([data],getRootNode());
                    }

                }).error(function(data,header,config,status){
                    warnDialog("服务器网络异常",5);
                });
            }else if($scope.orgz.modfiy=="update"){
                console.log($scope.orgz);
                $http({
                    params:$scope.orgz,
                    url:'/api/saveOrgz',
                    method:'post'
                }).success(function(data,header,config,status){
                    $scope.closeLayer();
                    $scope.orgzTree.updateNode($scope.selectNode,data);
                }).error(function(data,header,config,status){
                    warnDialog("服务器网络异常",5);
                });
            }

        }
        //删除树节点
        $scope.deleteOrgz=function(){
            var params={};
            if($scope.selectNode!=null){
               if($scope.selectNode.children==null||$scope.selectNode.children.length<1){
                   //console.log(getRootNode)
                   if(getRootNode().id==$scope.selectNode.id){
                       warnDialog("总公司不允许删除",5);
                       return ;
                   }
                   params={
                       id:$scope.selectNode.id
                   }
                   confirmDialog(
                       "是否删除"+$scope.selectNode.name+($scope.selectNode.orgzType==1?"公司":"部门"),
                       {icon: 3, title:'提示'},
                       function(){
                           $http({
                               params:params,
                               url:'/api/deleteOrgz',
                               method:'get'
                           }).success(function(data,header,config,status){
                               if(data.msg=="success"){
                                   $scope.orgzTree.remove($scope.selectNode);
                                   $scope.selectNode=null;
                                   warnDialog("操作成功",6);
                               }else{
                                   warnDialog("组织已关联用户，无法删除",5);
                               }

                           }).error(function(data,header,config,status){
                               warnDialog("服务器网络异常",5);
                           });
                       },
                       function(index) {
                           layer.close(index);
                       }
                   )
                }else{
                   warnDialog("请先删除该节点下的数据",5)
                }
            }else{
                warnDialog("请选择树节点后再编辑",5)
            }
        }



        // 性别
        $scope.types = [{value: 1, text: "男"}, {value: 2, text: "女"}];
        //列表初始化信息
        var vm1 = $scope.vm1 = {
            htmlSource: "",
            showErrorType: "1",
            showDynamicElement: true,
            dynamicName: "dynamicName",
            user: {}
        };
        vm1.validateOptions = {
            blurTrig: true,//光标移除元素后是否验证并显示错误提示信息
            showError  : true, // 显示错误信息
            removeError: true , // 验证通过后在元素的后面移除错误信息
        };
        var cellTemplate='<ui-button class="grid-btn primary-bg" icoclass="iconfont icon-bianji" ng-click="grid.appScope.showUser(row)" permission-code="edit" title="编辑"/>' +
            '<button class="btn grid-btn danger-bg" ng-click="grid.appScope.operationUser(row,1)" permission-code="qiyong" title={{row.entity.activated|titleChange}}><i class="{{row.entity.activated|iconChange}}"></i></button>'+
            '<ui-button class="grid-btn danger-bg" icoclass="iconfont icon-password" permission-code="qiyong" ng-click="grid.appScope.operationUser(row,2)" title="重置密码"/>'+
            '<ui-button class="grid-btn primary-bg" icoclass="iconfont icon-fenpeijiaose" permission-code="qiyong"  ng-click="grid.appScope.showUserToRole(row)" title="分配角色"/>';
        var colModel=[
            { field: 'number',displayName: '序号', width: '5%', enableColumnMenu:false,enableSorting:false },
            { field: 'id',displayName: '操作', width: '20%', cellTemplate:cellTemplate ,enableColumnMenu:false,enableSorting:false },
            { field: 'code', displayName: '编号',type: 'text', width: '5%',cellTooltip: true ,enableColumnMenu:false,enableSorting:false },
            { field: 'name', displayName: '名称',type: 'text', width: '20%',cellTooltip: true,enableColumnMenu:false,enableSorting:false },
            //cellFilter 属性过滤
            { field: 'activated', displayName: '状态',type: 'text', width: '20%',cellTooltip: true,cellFilter: 'format',enableColumnMenu:false,enableSorting:false },
            { field: 'userUrl', displayName: '路径' ,type: 'text',width: '32%', cellTooltip: true,enableColumnMenu:false,enableSorting:false }
        ];
        $scope.gridOptions={
            data:$scope.MyData,
            paginationPageSizes: [5,30,40,50],
            paginationPageSize: 5,
            useExternalPagination: true,
            columnDefs: colModel,
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

        loadGridData(pageData);

        // 添加和编辑用户弹框
        $scope.showUser=function(row){
            if(row){
                vm1.user=$.extend({},{},row.entity);
                if(row.entity.birthday){
                    vm1.user.birthday=new Date(row.entity.birthday);
                }
                $scope.userDailog=layer.open({
                    type: 1,
                    title:  '编辑用户',
                    area   : ['900px', '600px'],
                    contentUrl: 'app/erm/organization/formTemplate.html',
                    scope:$scope
                });
            }else{
                if($scope.selectNode){
                    vm1.user={
                        langKey: "zh-cn",
                        password: "123456",
                        organization:{
                            id:$scope.selectNode.id
                        },
                        userUrl:($scope.selectNode.orgzUrl?$scope.selectNode.orgzUrl:"")+$scope.selectNode.name
                    };
                    $scope.userDailog=layer.open({
                        type: 1,
                        title:  '新增用户',
                        area   : ['680px', '600px'],
                        contentUrl: 'app/erm/organization/formTemplate.html',
                        scope:$scope,
                        resize:false
                    });
                }else{
                    warnDialog("请先选择组织机构在添加用户",5)
                }
            }

            $scope.userClose = function(){
                layer.close($scope.userDailog);
            }
        };


        $scope.operationUser=function(row,flag){
            if(flag==1){
                 var str=row.entity.activated?"禁用":"启用";
                 confirmDialog(
                    "是否"+str+"【用户】账号",
                    {icon: 3, title:'提示'},
                    function(){
                        row.entity.activated=row.entity.activated?false:true;
                        OrganizationService.update(row.entity, function(result, headers){
                            if(result.activated){
                                warnDialog("启用成功",1);
                            }else{
                                warnDialog("禁用成功",1);
                            }
                            loadGridData(pageData,$scope.selectNode);
                        });
                    },
                    function(index) {
                        layer.close(index);
                    }
                )
            }else if(flag==2){
                $http({
                    params:{id:row.entity.id},
                    url:'/api/userInfo/resetPassword',
                    method:'get'
                }).success(function(data,header,config,status){
                    warnDialog("重置密码成功",1);
                }).error(function(data,header,config,status){
                    warnDialog("服务器网络异常",5);
                });
            }
        }



        //添加和编辑用户的 保存操作
        vm1.saveUser=function(){
            if(vm1.user.id){
                OrganizationService.update(vm1.user, function(result, headers){
                    layer.close($scope.userDailog);
                    loadGridData(pageData,$scope.selectNode);
                });
            }else{
                OrganizationService.save(vm1.user, function(result, headers){
                    if(!result.id){
                        warnDialog("登录名重复",5);
                    }else{
                        layer.close($scope.userDailog);
                        pageData.page=0;
                        loadGridData(pageData,$scope.selectNode);
                    }
                });
            }
        };


        vm1.saveEntity = function ($event) {
            warnDialog("保存成功！",1);
        };

        $scope.fields = [
                {placeholder: '用户名',name:'Username',type:'text',title:'1',isRequired: true},
                {placeholder: '密码',name:'Password' ,type:'password',title:'11',isRequired: true},
                {placeholder: '邮箱 (optional)',name:'Email',type:'email', title:'122',isRequired: false}
        ];
        $scope.showUserToRole=function(row){
            vm1.user=$.extend({},{},row.entity);
            $scope.toRoleDailog=layer.open({
                type: 1,
                title:  '给【'+vm1.user.name+'】分配角色',
                area   : ['1000px', '600px'],
                maxmin: true,
                contentUrl: 'app/erm/organization/dialog/userToRoleDialog.html',
                scope:$scope
            });
            $http({
                params:{id:row.entity.id,flag:true},
                url:'/api/user/findAllRole',
                method:'get'
            }).success(function(data,header,config,status){
                $scope.gridOptionsYesRole.data=data
            }).error(function(data,header,config,status){
                warnDialog("服务器网络异常",5);
            });
            $http({
                params:{id:row.entity.id,flag:false},
                url:'/api/user/findAllRole',
                method:'get'
            }).success(function(data,header,config,status){
                $scope.gridOptionsNoRole.data=data
            }).error(function(data,header,config,status){
                warnDialog("服务器网络异常",5);
            });
        };
        $scope.closeToRoleDailog=function(){
            layer.close($scope.toRoleDailog);
        }
        $scope.saveUserRole= function () {
            var rolelist=$scope.gridOptionsYesRole.data;
            var roleUsers=[];
            rolelist.forEach(function(role){
                var roleUser={
                    user:{id:vm1.user.id},
                    role:{id:role.id}
                }
                roleUsers.push(roleUser);
            })
            vm1.user.roles=roleUsers;
            $http({
                data:vm1.user,
                url:'/api/user/addUserRole',
                method:'put'
            }).success(function(data,header,config,status){
                $scope.closeToRoleDailog();
            }).error(function(data,header,config,status){
                warnDialog("服务器网络异常",5);
            });
        }

        $scope.right=function(){
            $scope.gridApiNoRole.selection.getSelectedRows().forEach(function(row){
                $scope.gridOptionsYesRole.data.push(row);
                $scope.gridOptionsNoRole.data.splice($scope.gridOptionsNoRole.data.indexOf(row),1);
            })
        }
        $scope.left=function(){
            $scope.gridApiYesRole.selection.getSelectedRows().forEach(function(row){
                $scope.gridOptionsNoRole.data.push(row);
                $scope.gridOptionsYesRole.data.splice($scope.gridOptionsYesRole.data.indexOf(row),1);
            })
        }
        var colModel=[
            { field: 'id',displayName: '序号',type: 'text', width: '20%', cellTooltip: true ,enableColumnMenu:false },
            { field: 'name', displayName: '角色名称',type: 'text', width: '20%',cellTooltip: true,enableColumnMenu:false },
            { field: 'describe', displayName: '角色描述',type: 'text', width: '20%',cellTooltip: true,enableColumnMenu:false }
        ];
        $scope.gridOptionsYesRole={
            data:[],
            paginationPageSize: 5,
            columnDefs: colModel,
            onRegisterApi : function(gridApi) {
                $scope.gridApiYesRole = gridApi;
            }
        };
        $scope.gridOptionsNoRole={
            data:[],
            paginationPageSizes: [5,30,40,50],
            paginationPageSize: 5,
            columnDefs: colModel,
            onRegisterApi : function(gridApi) {
                $scope.gridApiNoRole=gridApi
            }
        };
        //图片上传提交
        $scope.getFile = function () {
            var fd = new FormData();
            fd.append('file', $scope.myFile);
            var args = {
                method: 'POST',
                url: "/api/upload",
                data: fd,
                headers: {'Content-Type': undefined},
                transformRequest: angular.identity
            };
            $http(args).success(function(data,header,config,status){
                if(data.length>0){
                    vm1.user.imageUrl=data[0].fileUrl;
                }
            }).error(function(data,header,config,status){
                warnDialog("服务器网络异常",5);
            });
        };
    }
})();

