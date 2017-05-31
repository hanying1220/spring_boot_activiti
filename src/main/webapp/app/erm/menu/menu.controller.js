angular
    .module('erpApp')
    .controller('MenuController', MenuController);

 MenuController.$inject = ['$scope','$http','MenuService','permissionService','layer','Principal'];

function MenuController ($scope,$http,MenuService,permissionService,layer,Principal) {
    $scope.menu={};

    /*树初始化*/
    $scope.treeData=[];
    $scope.MenuActions=[];

    //判断是否是ROLE_SYS_ADMIN
    $scope.isSysAdmin = Principal.isSysAdminAuthority();
    //$scope.isSysAdmin=true;


    $scope.refreshTree=function(){
        initTreeData();
    }
    $scope.onitemclick=function(node){
        loadData(node.id);
    }
    $scope.onloadbranch=function(node,success,error){
        var result =  $http({
            url:'/api/erm/findAllMenu',
            method:'GET',
            params:{id:node.id}
        });
        result.then(function(response){
            var data=response.data;
            var menus =  [];
            angular.forEach(data, function (item) {
                var menu={
                    id:item.id,
                    parentId: item.parent==null ? null : item.parent.id ,
                    name:item.name,
                    cls:item.icon
                }
                menus.push(menu);
            });
            success(menus);
        })
    }

    /*表格初始化*/
    var cellTemplate='<ui-button class="grid-btn primary-bg" icoclass="iconfont icon-bianji" ng-click="grid.appScope.edit(row)"    ng-show="grid.appScope.isSysAdmin"  title="编辑"/><ui-button class="grid-btn danger-bg" icoclass="iconfont icon-del" ng-click="grid.appScope.remove(row)"   permission-code="Delete" title="删除"/>';

    var colModel=[
        { field: 'number',displayName: '序号', width: '5%', enableColumnMenu:false },
        { field: 'id',displayName: '操作', width: '15%', cellTemplate:cellTemplate ,visible:$scope.isSysAdmin ,enableColumnMenu:false },
        { field: 'code', displayName: '菜单编号',type: 'text', width: '20%',cellTooltip: true ,enableColumnMenu:false },
        { field: 'name', displayName: '菜单名称',type: 'text', width: '20%',cellTooltip: true,enableColumnMenu:false },
        { field: 'path', displayName: '菜单路径' ,type: 'text',width: '20%', cellTooltip: true,enableColumnMenu:false },
        { field: 'icon', displayName: '菜单图标',type: 'text', width: '20%',cellTooltip: true,enableColumnMenu:false },
        { field: 'type', displayName: '菜单类型' ,visible:false  }
    ];
    $scope.gridOptions={
        columnDefs: colModel,
        data:[],
        onRegisterApi : function(gridApi) {
            $scope.gridApi = gridApi;
        }
    }
    /*加载数据*/
    initTreeData();


    $scope.remove=function(row){
        layer.confirm('是否确认删除？', {
            btn: ['确认', '取消'],
            btn2: function(index, layero){
                layer.close(index)
            }
        }, function(index, layero){
            MenuService.delete({id:row.entity.id},function(){
                var index = $scope.gridOptions.data.indexOf(row.entity);
                $scope.gridOptions.data.splice(index,1);
                showMessageTip('删除成功',1);
            },onError);
            layer.close(index)
        });
    }



    function showMessageTip(content,icon){
        layer.msg(content, {icon: icon});
    }

    function initTreeData(){
        var result =  $http({
            url:'/api/erm/findAllMenu',
            method:'GET'
        });
        result.then(function(response){
            var data=response.data;
            var menus =  [{id:null,name:'菜单结构',parentId:0,selected:true,cls:'iconfont icon-shuaxin'}];
            angular.forEach(data, function (item){
                menu={
                    id:item.id,
                    parentId: item.parent==null ? null : item.parent.id ,
                    name:item.name,
                    cls:item.icon,
                    isbranch:true
                }
                menus.push(menu);
            });
            $scope.treeData=menus;

            var data = angular.fromJson(response.data);
            var menus=[];
            for(var i=0;i<data.length;i++){
                menus.push($.extend({number:i+1},data[i],{})) ;
            }
            $scope.gridOptions.data=menus;
        });
    }

    function loadData(parentId){
        var result =  $http({
            url:'/api/erm/findAllMenu',
            method:'GET',
            params:{id:parentId}
        });
        result.then(function(response){
            var  data = angular.fromJson(response.data);
            var menus=[];
            for(var i=0;i<data.length;i++){
                menus.push($.extend({number:i+1},data[i],{}));
            }
            $scope.gridOptions.data=menus;
        });
    }

    function onError(error) {
        showMessageTip(error.data.message,'');
    }


    //表单验证
    $scope.vm= {
        htmlSource: "",
        showErrorType: "1",
        showDynamicElement: true,
        dynamicName: "dynamicName",
        validateOptions : {
            blurTrig: true,//光标移除元素后是否验证并显示错误提示信息
            showError  : true, // 显示错误信息
            removeError: true , // 验证通过后在元素的后面移除错误信息
        }
    };

    var result =  $http({
        url:'/api/erm/findAllMenu',
        method:'GET'
    }).then(function(response) {
        $scope.MenuOptions=response.data;
    });


    /*弹出菜单组*/
    $scope.addGroup=function(){
        $scope.parentId=null;
        $scope.menu={type:'group'};
        showMenuGroup(true);
    }
    /*弹出菜单项*/
    $scope.addItem=function(){
        $scope.parentId=null;
        $scope.menu={type:'item'};
        showMenuItem(true);
    }
    /*编辑菜单*/
    $scope.edit=function(row){
        $scope.parentId=null;
        var result =  $http({
            url:'api/erm/findMenuById',
            method:'GET',
            params:{id : row.entity.id}
        });
       result.then(function(response) {
            $scope.menu=response.data;
            $scope.gridAction.data=$scope.menu.actions;
            if($scope.menu.parent){
                $scope.parentId=$scope.menu.parent.id;
            }
           if($scope.menu.type=='group'){
               showMenuGroup(false);
           }
           if($scope.menu.type=='item'){

               showMenuItem(false);
           }
        });
    }


    function showMenuGroup(isAdd){
        var title='';
        if(isAdd){
            title='新增菜单组';
        }else{
            title='编辑菜单组';
        }
        $scope.dailog =  layer.open({
            type:1,
            title:title,
            area   : ['680px','260px'],
            contentUrl: 'app/erm/menu/dialog/menuGroup.html',
            scope:$scope,
            resize:false
        });
    }

    function showMenuItem(isAdd){

        findMenuActions();

        showAuthorities();

        var title='';
        if(isAdd){
            title='新增菜单项';
        }else{
            title='编辑菜单项';
        }
        $scope.dailog =  layer.open({
            type:1,
            title:title,
            area   : ['680px','auto'],
            contentUrl: 'app/erm/menu/dialog/menuItem.html',
            scope:$scope,
            resize:false
        });
    }

    function findMenuActions() {
        $http.get('/api/erm/findMenuActions',{})
            .success(function(data){
                angular.forEach(data, function (action) {
                    action.checked=false;
                    action.id=null;
                    if($scope.menu.actions!=null && $scope.menu.actions.length>0){
                        angular.forEach($scope.menu.actions, function (item) {
                            if(action.value==item.value){
                                action.checked=true;
                            }
                        });
                    }
                });
                $scope.MenuActions=data;
            });
    }

    $scope.save =function() {
        if($scope.menu.type=='item'){
            $scope.menu.parent=getMenuById($scope.parentId);
            $scope.menu.actions=$scope.gridAction.data;
            $scope.menu.param=getStrAuthorities();
        }
        $scope.isSaving = true;
        if ($scope.menu.id !== null) {
            MenuService.update($scope.menu, onSaveSuccess, onSaveError);
        } else {
            MenuService.save($scope.menu, onSaveSuccess, onSaveError);
        }
    }

    $scope.clear =function() {
        layer.close($scope.dailog);
    }
    function onSaveSuccess (result) {
        $scope.isSaving = false;
        layer.close($scope.dailog);



        var menu={};
        if(result.type=='group'){
            menu={
                id:result.id,
                parentId:  null  ,
                name:result.name,
                cls:result.icon,
                isbranch:true
            }
            $scope.MenuOptions.push(menu);
        }

        //initTreeData();

        //if(result.type=='item'){
        //    menu={
        //        id:result.id,
        //        parentId:  result.parent.id ,
        //        name:result.name,
        //        cls:result.icon,
        //        isbranch:false
        //    }
        //}
        //$scope.treeData.push(menu);


    }

    function onSaveError () {
        $scope.isSaving = false;
    }



    $scope. onAuthoritieSelect=function(event,item){
        item.checked = event.target.checked;
    }

    function showAuthorities(){

        $scope.authoritiesOptions=[
            {value:'ROLE_SYS_ADMIN',text:'系统管理员',checked:false},
            {value:'ROLE_TENANT_ADMIN',text:'企业管理员',checked:false},
            //{value:'ROLE_TENANT_USER',text:'企业管用户',checked:false},
            {value:'ROLE_ANONYMOUS',text:'匿名用户',checked:false}
        ];
       var params = $scope.menu.param;
       if(params!=null){
           angular.forEach($scope.authoritiesOptions, function (item) {
               if(params.indexOf(item.value)!=-1){
                   item.checked=true;
               }
           });
       }
    }
    function getStrAuthorities(){
        var params='';
        angular.forEach($scope.authoritiesOptions, function (item) {
            if(item.checked){
                if(params.length>0){
                    params=params+',';
                }
                params=params+item.value;
            }
        });
        return params;
    }

    /*动作点grid*/
    var cellAction='<ui-button class="grid-btn danger-bg" icoclass="iconfont icon-shanchu" ng-click="grid.appScope.removeAction(row)" label="删除"/>';
    var colAction=[
        { field: 'id', displayName: '操作',width: '20%', enableCellEdit: false,cellTemplate:cellAction ,cellTooltip: true,enableColumnMenu:false},
        { field: 'text', displayName: '名称', width: '40%',type:'text',cellTooltip: true,enableColumnMenu:false },
        { field: 'value', displayName: '操作符', width: '40%',type:'text',cellTooltip: true,enableColumnMenu:false }
    ];
    $scope.gridAction={
        columnDefs: colAction,
        data:$scope.menu.actions,
        onRegisterApi : function(gridApi) {
            $scope.gridApi = gridApi;
        }
    }


    $scope.onCheckSelect=function(event,action){
        action.checked = event.target.checked;
        if(action.checked){
            addActionToGrid(action);
        }
        //else{
        //    removeGridAction(action);
        //}
    }
    $scope.removeAction=function(row){
        removeGridAction(row.entity);
    }

    $scope.addAction=function(){
        addActionToGrid({});
    }
    function removeGridAction(entity){
        var index = $scope.gridAction.data.indexOf(entity);
        $scope.gridAction.data.splice(index,1);
    }

    function addActionToGrid(row){
        var result={
            text:row.text,
            value:row.value
        };
        $scope.gridAction.data.push(result);
    }

    function getMenuById(id){
        var result=null;
        angular.forEach($scope.MenuOptions,function(menu){
            if(menu.id==id){
                result= menu;
            }
        });
        return result;
    }


    /*
      分页延迟加载
    * */

    //{id:'root',name:'菜单结构',parentId:'',selected:true,cls:'iconfont icon-shuaxin',closed:true},
    //{id:'1',name:'系统管理',parentId:'root',cls:'iconfont icon-xitong'},
    //{id:'2',name:'基础管理',parentId:'root',cls:'iconfont icon-dangan'},
    //{id:'3',name:'设计管理',parentId:'root',cls:'iconfont icon-sheji'},
    //{id:'101',name:'Demo管理',parentId:'root',cls:'glyphicon glyphicon-th-large icon text-success'},
    //{id:'11',name:'菜单管理',parentId:'1'},
    //{id:'12',name:'组织管理',parentId:'1'},
    //{id:'13',name:'角色管理',parentId:'1'},
    //{id:'14',name:'授权管理',parentId:'1'}

    //$scope.testData= [{id:'root',name:'菜单结构',parentId:'',selected:true,cls:'iconfont icon-shuaxin',closed:true}];

    //function loadMenus (pageNumber,pageSize,parentId) {
    //    MenuService.query({page:pageNumber-1,size:pageSize,sort:'code',  parentId:parentId || 0 }, function(data, headers){
    //        $scope.gridOptions.data = data;
    //        $scope.gridOptions.totalItems = headers("X-Total-Count");
    //    }, onError);
    //}
    //
    //initTestData();
    //function initTestData(){
    //    var result =  $http({
    //        url:'/api/erm/findAllMenu',
    //        method:'GET'
    //    });
    //    result.then(function(response){
    //        var data=response.data;
    //        var menus =  [{id:null,name:'菜单结构',parentId:0,selected:true,cls:'iconfont icon-shuaxin'}];
    //        angular.forEach(data, function (item) {
    //            var menu={
    //                id:item.id,
    //                parentId: item.parent==null ? null : item.parent.id ,
    //                name:item.name,
    //                cls:item.icon,
    //                isbranch:true
    //            }
    //            menus.push(menu);
    //        });
    //        $scope.testData=menus;
    //    });
    //}
    //
    //


    //$scope.gridOptions={
    //
    //    //paginationPageSizes: [10,20,30,40,50],
    //    //paginationPageSize: 10,
    //    columnDefs: colModel,
    //    //useCustomPagination: true,
    //    //useExternalPagination : true,
    //
    //    //showTreeExpandNoChildren:false,
    //    onRegisterApi : function(gridApi) {
    //        $scope.gridApi = gridApi;
    //        //gridApi.pagination.on.paginationChanged($scope, function (pageNumber, pageSize) {
    //        //     loadMenus(pageNumber,pageSize, $scope.parentId);
    //        //});
    //
    //    }
    //};
    //loadMenus(1,$scope.gridOptions.paginationPageSize, $scope.parentId);

}
