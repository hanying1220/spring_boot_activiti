angular.module('erpApp')
    .directive('uiTree', ['$resource','TreeService', function($resource,TreeService) {
        return {
            restrict: 'AC',
            template: '<div><ul id={{treeId}} class="ztree"></ul></div>',
            scope:{
                refs: '=',
                data: '=',
                setting:'='
            },
            link: function(scope, el, attr) {
                scope.treeId=attr.refs;
                var setting = {
                    view: {
                        dblClickExpand: false,//双击节点时，是否自动展开父节点的标识
                        showLine: true,//显示下划线
                        selectedMulti: false,//设置是否允许同时选中多个节点。
                        expandSpeed: 400//"slow"//节点展开速度
                    },
                    check:{
                        enable:scope.setting.enable
                    },
                    data: {
                        simpleData: {//是否为简单数据类型JSON
                            enable:true,
                            idKey:   "id",//使用简单必须标明的的节点对应字段
                            pIdKey:   "parentId"  ,//使用简单必须标明的的父节点对应字段
                            rootPId:  null//根
                        }
                    },
                    async: {
                        enable:scope.setting.async ,//异步加载
                        //请求地址，可用function动态获取
                        url:scope.setting.url,
                        contentType:"application/x-www-form-urlencoded",//按照标准的 Form 格式提交参数
                        autoParam:["id"],//提交的节点参数，可用“id=xx”取请求提交时的别名
                        //otherParam:{"otherParam":"zTreeAsyncTest"},//提交的其他参数,json的形式
                        dataType:"json",//返回数据类型
                        type:"get",//请求方式
                        dataFilter: null//数据过滤
                    },
                    callback: {
                        onClick:function(event, treeId, treeNode){
                            var zTree = $.fn.zTree.getZTreeObj(treeId);
                            if(scope.refs.onSelect){
                                scope.refs.onSelect(treeNode);
                            }
                            if (treeNode.isParent) {//如果是父节点
                                if(treeNode.open){//父节点为展开状态，折叠父节点
                                    zTree.expandNode(treeNode,false,true,true,false);
                                    //expandNode参数说明：节点，展开(true)/折叠(false)，是否影响子孙节点，是否设置焦点，是否触发beforeExpand/onExpand或beforeCollapse/onCollapse事件回调函数
                                }
                                else{//父节点是折叠的
                                    zTreeBeforeExpand(treeId, treeNode);
                                    zTree.expandNode(treeNode,true,false,true,false);//如果是根节点则展开
                                }
                                return false;
                            } else {//不是父节点，打开对应链接
                                return true;
                            }
                        },//节点被点击时调用的函数
                        onAsyncError: function (event, treeId, treeNode, XMLHttpRequest, textStatus, errorThrown) {

                        },//异步加载失败调用的函数
                        beforeExpand:zTreeBeforeExpand//用于捕获父节点展开之前的事件回调函数，并且根据返回值确定是否允许展开操作
                    }
                };
                function zTreeBeforeExpand(treeId, treeNode) {
                    var zTree = $.fn.zTree.getZTreeObj(treeId);
                    if(scope.setting.async){
                        var nodes = zTree.getSelectedNodes();
                        zTree.reAsyncChildNodes(treeNode, "refresh");//异步刷新，清空后加载，加载后打开,需要不打开加参数true
                        zTree.selectNode(nodes[0]);
                        return false;//使用了异步强行加载，如果用true,节点展开将不会按照expandSpeed属性展开，false将按照设定速度展开
                    }else{
                        return true;
                    }

                };
                scope.refs.selectRootNode=function(){
                    var zTree = $.fn.zTree.getZTreeObj(attr.refs);
                    zTree.selectNode(zTree.getNodes()[0]);
                    if(scope.refs.onSelect){
                        scope.refs.onSelect(zTree.getNodes()[0]);
                    }
                };
                scope.refs.init=function(data){
                    $.fn.zTree.init($("#"+attr.refs), setting, data);
                    if(scope.setting.defSelecte){
                        scope.refs.selectRootNode();
                    }
                };

                scope.refs.addNodes=function(treeNode,addNode) {
                    var zTree = $.fn.zTree.getZTreeObj(attr.refs);
                    zTree.addNodes(treeNode, addNode);
                };
                scope.refs.removeNode=function(treeNode){
                    var zTree = $.fn.zTree.getZTreeObj(attr.refs);
                    zTree.removeNode(treeNode);
                }
                scope.refs.updateNode=function(updateTreeNode){
                    var zTree = $.fn.zTree.getZTreeObj(attr.refs);
                    zTree.updateNode(updateTreeNode,false);
                }
                scope.$watch('data', function (newValue) {
                    if(newValue) {
                        scope.refs.init(newValue);
                    }
                },false);
            }
        };
    }]);
