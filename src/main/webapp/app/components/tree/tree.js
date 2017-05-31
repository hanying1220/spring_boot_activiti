'use strict';
angular.module('ui.tree',[])
    .factory('treeService', function () {
        var treeService = {};
        /**
         * json格式转哈希、树状结构
         * @param {json} dataSrc json数据（hash结构）
         * @param {object} opts 配置
         * - idfield id字段的属性名
         * - pidfield 父id的字段的属性名
         * @return	{Array} 数组[哈希表结构,树结构]
         */
        treeService.transData = function (dataSrc, opts){
            var tree = [], hash = {}, i = 0, len = dataSrc.length,data;
            var id=opts['idfield']||'id', pid=opts['pidfield']||'pid';
            while(i < len){// 防止子节点向父节点扩展 children 时父节点尚未存入 hash
                data=dataSrc[i++];
                hash[data[id]] = data;// 哈希表结构 - 以 id 字段为 key
            }
            i=0;
            while(i < len){
                data = dataSrc[i++];
                var hashVP = hash[data[pid]];// 父节点
                // 树结构
                if(hashVP){// 向父节点中添加
                    !hashVP['children'] && (hashVP['children'] = []);
                    hashVP['children'].push(data);
                }else{
                    tree.push(data);
                }
            }
            return [hash,tree];
        };
        return treeService;
    })

    .factory('RecursionHelper', ['$compile', function($compile){
        return {
            /**
             * 手动编译element，解决递归循环的问题
             * @param element
             * @param [link] post link 或者 {pre-link, post-link}
             */
            compile: function(element, link){

                // 规范link参数
                if(angular.isFunction(link)){
                    link = { post: link };
                }

                // 通过移除内容来打破递归循环
                var contents = element.contents().remove();
                var compiledContents;// 编译后的内容
                return {
                    pre: (link && link.pre) ? link.pre : null,

                    post: function(scope, element){
                        // 编译内容
                        if(!compiledContents){
                            compiledContents = $compile(contents);
                        }
                        // 重新添加内容
                        compiledContents(scope, function(clone){
                            element.append(clone);
                        });

                        // 如果存在post link，调用之
                        if(link && link.post){
                            link.post.apply(null, arguments);
                        }
                    }
                };
            }
        };
    }])

    .filter('treeNodeFilter', function () {
        return function (hashData, search, labelField, pidFiled, idField) {
            // 分支中只要有一个节点符合条件，则整条分支都返回；兄弟节点中不符合条件的未移除
            var hash = {},result = [];

            if(search) {
                // 根据关键字过滤出节点
                angular.forEach(hashData, function (item) {
                    if(item && -1 != item[labelField].indexOf(search)) {
                        // 找到祖先节点
                        while(item['__parent']) {
                            item = item['__parent']
                        }
                        if(!hash[item[idField]]) {
                            hash[item[idField]] = item;
                            result.push(item);
                        }
                    }
                })
            } else {
                angular.forEach(hashData, function (item) {
                    if(item && !item['__parent']) {
                        result.push(item);
                    }
                })
            }

            return result;
        }
    })

    /**
     * @ngdoc directive
     * @name ui.wisoft.tree.directive:wiTree
     * @restrict E
     *
     * @description
     * 树
     *
     * @param {array} dataprovider 数据源.<br />
     *   id: id字段，可通过 idfield 指定<br />
     *   pid: parentid 字段，可通过 pidfield 指定<br />
     *   text: 显示字段，可通过 labelfield 指定<br />
     *   isbranch: 是否为分支字段，若指定 isbranch=true，则其拥有子节点，需要延迟加载 - 多选且级联选中时不支持<br />
     *   selected: 初始时是否选中，默认为 false<br />
     *   closed: 是否折叠，默认为 false<br />
     *   cls: 节点图标的 class
     * @param {string=} idfield id字段，默认'id'.
     * @param {string=} pidfield parentid字段，默认'pid'.
     * @param {string=} labelfield 显示字段，默认'text'.
     * @param {boolean=} multiselect 多选，false|true，默认 false.
     * @param {string=} pcls 父节点图标 class
     * @param {string=} ccls 叶子节点图标 class
     * @param {boolean=} istree 数据源是否为树形，默认为 false.
     * @param {bool=} cascade 支持多选时，是否级联父子节点的选中状态，默认为 false.
     * @param {string=} itemrenderer 自定义节点渲染.
     * @param {string=} filterby 过滤.
     * @param {object=} wid 若定义了此属性，可供调用接口。调用方法参见：wid.
     * @param {function=} onitemclick 点击节点时的回调函数:onitemclick(node).
     * @param {function=} onloadbranch 加载延迟节点（isbranch=true 的节点）时的回调函数: onloadbranch(node,success,error).<br />
     * - success(children) 延迟加载成功后的回调函数，参数为要添加到 node 下的子节点;<br />
     * - error() 延迟加载失败后的回调函数.
     * @param {function=} onbeforeexpand 节点展开前的回调函数,返回 false 时阻止展开:onbeforeexpand(node).
     * @param {function=} onexpand 节点展开时的回调函数:onexpand(node).
     * @param {function=} onbeforecollapse 节点折叠前的回调函数,返回 false 时阻止折叠:onbeforecollapse(node).
     * @param {function=} oncollapse 节点折叠时的回调函数:oncollapse(node).
     * @param {function=} onbeforeselect 节点选中前的回调函数:onbeforeselect(node).
     * @param {function=} onselect 节点选中时的回调函数:onselect(node).
     * @param {function=} oncancelselect 取消节点选中时的回调函数:oncancelselect(node).
     *
     */
    .directive('uiTree',['RecursionHelper','treeService','$filter','$parse',function (RecursionHelper,treeService,$filter,$parse) {
        return {
            restrict:'E',
            transclude:true,
            templateUrl: 'app/components/tree/template/treeTemplate.html',
            replace:true,
            scope: {
                // Properties
                dataprovider:'='// 数据源
                ,filterby:'='// 过滤
//                ,orderby:'@'// 排序字段，默认'id' TODO
                ,wid:'='// 供外部操作tree
                ,labelfunction:'&'// TODO
                // Events
                ,onitemclick:'&'
                ,onloadbranch:'&'
                ,onbeforeexpand:'&'
                ,onexpand:'&'
                ,onbeforecollapse:'&'
                ,oncollapse:'&'
                ,onbeforeselect:'&'
                ,onselect:'&'
                ,oncancelselect:'&'
            },
            require: 'uiTree',
            controller: ['$scope','treeService', function ($scope,treeService) {
                var ctrl = this;
                $scope.isRoot = !$scope.$parent._treeCtrl;// 若父scope未定义 _treeCtrl 则为根节点
                if($scope.isRoot){
                    $scope._treeCtrl = ctrl;
                }else{// 统一为根节点的 controller
                    $scope._treeCtrl = $scope.$parent._treeCtrl;
                    return;
                }

                var conf = ctrl.conf = {}
                    ,curNode// 记录高亮行
                    ,selNode;// 记录选中行（单选条件下）
                ctrl.handler = {};
                ctrl._hashData = {};

                /**
                 * 根据父节点 pNode 配置其子节点 nodes 的附加属性
                 *   __parent 父节点
                 *   __closed 是否折叠
                 *   __selected 是否选中
                 *   __level 节点层级
                 * @param {Array} nodes json数据（树形结构）
                 * @param {Object=} pNode 父节点，未定义表示 nodes 均为一级节点
                 */
                ctrl.initData = function(nodes, pNode){
                    if(conf.multiselect) {// 多选
                        ctrl.setMultiInit(nodes, pNode);
                    }else{// 单选
                        ctrl.setRadioInit(nodes, pNode);
                    }
                };
                ctrl.setMultiInit = function(nodes, pNode){
                    var _level= pNode ? pNode['__level']+1 : 0
                        ,selCount=0;
                    angular.forEach(nodes, function (node) {

                        node['__level'] = _level;
                        pNode && (node['__parent'] = pNode);
                        node['__closed']=node['closed'];
                        node['__selected']=node['selected'];
//                        node['__loading']=false;
//                        node['__current']=false;
                        if(!conf.cascade && node['isbranch']){// 非级联时才允许延迟加载
                            node['__closed']=true;
                            node['children'] ? node['children'].length=0 : node['children']=[];
                        }else if(node['isbranch'] || (node['children'] && !node['children'].length)){// 级联时的延迟加载作为叶子处理
                            node['children'] = undefined;
                        }
                        if(node['children'] && node['children'].length){// 有子节点
                            ctrl.setMultiInit(node['children'],node);
                        }
                        node['__selected'] && selCount++;
                    });
                    if(pNode && conf.cascade){// 级联，根据子节点修改父节点 __selected
                        if(selCount == nodes.length){//全选
                            pNode['__selected']=true;
                            pNode['__semi']=false;
                        }else if(selCount == 0){// 未选
                            pNode['__selected']=false;
                            pNode['__semi']=false;
                        }else{// 半选
                            pNode['__selected']=false;
                            pNode['__semi']=true;
                        }
                    }
                };
                ctrl.setRadioInit = function(nodes, pNode){

                    var _level= pNode ? pNode['__level']+1 : 0;
                    angular.forEach(nodes, function (node) {
                        node['__level'] = _level;
                        pNode && (node['__parent'] = pNode);

                        node['__closed']=node['closed'];
//                        node['__semi']=false;
//                        node['__loading']=false;
//                        node['__current']=false;
                        if(node['selected'] && !selNode){// 用户定义其选中且未定义其他选中项，选中、高亮并展开其所有父节点，
                            node['__selected']=true;
                            node['__current']=true;
                            curNode=node;
                            selNode=node;
                            (function(p){
                                while(p){
                                    p['__closed']=false;
                                    p=p['__parent'];
                                }
                            })(pNode);// 打开所有父节点
                        }else{
                            node['__selected']=false;
                            node['__current']=false;
                        }
                        if(node['children']) {// 有子节点
                            node['__closed']=true;
                            ctrl.setRadioInit(node['children'], node);

                        }else{
                            if(node['isbranch']){
                                node['__closed']=true;
                                node['children']=[];
                            }
                        }
                    });
                };

                ctrl.changeCur = function(node){// 切换高亮行
                    if(curNode == node) return;
                    if(curNode) curNode['__current']=false;// 取消原高亮行
                    curNode = node;
                    curNode && (curNode['__current'] = true);// node 为 undefined，仅清空高亮行
                };
                ctrl.changeSel = function(node){// 单选情况下切换选中项
                    if(selNode == node) return;
                    if(selNode) selNode['__selected']=false;// 取消原高亮行
                    selNode = node;
                    selNode && (selNode['__selected'] = true);// node 为 undefined，仅取消选中
                };

                /**
                 * 向 hash 注册 nodes 及其子节点
                 * @param {Array=} nodes 树形结构的数据
                 */
                var registerHash = function(nodes){
                    angular.forEach(nodes,function(node){
                        ctrl._hashData[node[conf.idfield]] = node;
                        node['children'] && registerHash(node['children']);
                    });
                };
                /**
                 * 转换 nodes 为树形，并向 hash 中注册
                 * @param {Array} nodes
                 * @param {Object=} pNode 父节点，未定义表示 nodes 均为一级节点
                 */
                ctrl.transData = function(nodes, pNode){
                    // 如果是递归的数据，需要转换
                    if(!conf['isTree']){
                        // 转换数据并注册 hash
                        var _data = treeService.transData(nodes,{
                            'idfield':conf.idfield
                            ,'pidfield':conf.pidfield
                            ,'childrenfield':'children'
                        });
                        angular.extend(ctrl._hashData, _data[0]);// 扩展 hash
                        nodes = _data[1];
                    }else{
                        registerHash(nodes);// 树形需手动注册
                    }
                    ctrl.initData(nodes,pNode);
                    return nodes;
                };
                // 移除 node 及其子节点
                ctrl.removeNode = function(node){
                    // 移除节点前，先处理高亮及选中
                    if(node['__current']) curNode=undefined;
                    if(node['__selected']) selNode=undefined;
                    node['children'] && angular.forEach(node['children'], function(child){
                        ctrl.removeNode(child);
                    });
                    delete ctrl._hashData[node[conf.idfield]];// 从 hash 数据中移除键值对
                };
                ctrl.destroyData = function(){// 存在历史数据源时，清除组件附加属性
                    curNode = undefined;
                    selNode = undefined;
                    if(!!ctrl._hashData){
                        angular.forEach(ctrl._hashData,function(data){
                            // 数据源解除 __parent、children 绑定，防止循环引用
                            if(data['__parent']) data['__parent']=null;
                            if(data['children']) data['children']=null;
                        });
                    }
                };
            }],
            compile: function(element) {
                return RecursionHelper.compile(element,{
                    post: function(scope,element,attrs){
                        var isRoot = scope.isRoot
                            ,ctrl = scope._treeCtrl;
                        var vm = scope.vm = {}// 记录每个子树不同的属性（_data）
                            ,conf = scope.conf = ctrl.conf;// 用户配置
                        var handler = scope.handler = ctrl.handler;// 所有子树公用的方法
                        /*** 根节点 ***/
                        if(isRoot){
                            var parentScope = scope.$parent;
                            // 默认值
                            angular.extend(conf, {
                                idfield: attrs['idfield'] || 'id'
                                ,pidfield: attrs['pidfield'] || 'pid'
                                ,labelfield: attrs['labelfield'] || 'text'
                                ,pCls: attrs['pcls']
                                ,cCls: attrs['ccls'] || 'icon-file'
                                ,multiselect: false
                                ,itemrenderer: attrs['itemrenderer']
                                ,isTree: attrs['istree']=='true'
                                ,cascade: attrs['cascade']=='true'
                                ,isbranch:attrs['isbranch']
                            });
//                            conf.orderby = scope.orderby || conf.idfield;
                            // 事件监听
                            conf.onitemclick = scope.onitemclick() || angular.noop;
                            conf.onloadbranch = scope.onloadbranch() || angular.noop;
                            conf.onbeforeexpand = scope.onbeforeexpand() || angular.noop;
                            conf.onexpand = scope.onexpand() || angular.noop;
                            conf.onbeforecollapse = scope.onbeforecollapse() || angular.noop;
                            conf.oncollapse = scope.oncollapse() || angular.noop;
                            conf.onbeforeselect = scope.onbeforeselect() || angular.noop;
                            conf.onselect = scope.onselect() || angular.noop;
                            conf.oncancelselect = scope.oncancelselect() || angular.noop;
                            /* 多选支持 */
                            (function(){
                                var _setMultisel;
                                if (attrs.multiselect) {// 有 multiselect 属性，监听
                                    var _getMultisel = $parse(attrs.multiselect);
                                    _setMultisel = _getMultisel.assign;
                                    conf.multiselect = _getMultisel(parentScope);
                                    _setMultisel && parentScope.$watch(_getMultisel, function(val, wasVal) {
                                        if(val !== wasVal){
                                            conf.multiselect = val;
                                            ctrl.changeCur();
                                            ctrl.initData(vm._data);
                                        }
                                    });
                                }
                                if(angular.isUndefined(_setMultisel)){// 不会变化，标记 ctrl.conf.multiselect
                                    ctrl.conf.multiselect = conf.multiselect;
                                }
                            })();
                            /* 数据源监听 */
                            scope.$watch('dataprovider', function (newValue) {
                                if(newValue) {
                                    ctrl.destroyData();// 销毁可能存在的原数据，避免其中children等对转换数据产生影响
                                    // 转换 nodes 为树形，并向 hash 中注册，配置树节点附加属性
                                    vm._data = ctrl.transData(scope.dataprovider);
                                }
                            },false);
                            /* 过滤监听 */
                            scope.$watch('filterby', function (newValue,oldValue) {
                                if(newValue != oldValue) {
                                    angular.forEach(ctrl._hashData, function (item) {
                                        if (item['__selected']) item['__selected']=false;
                                    });
                                    vm._data = $filter('treeNodeFilter')(ctrl._hashData,
                                        scope.filterby,
                                        conf.labelfield,
                                        conf.pidfield,
                                        conf.idfield);
                                }
                            },false);
                            /* 销毁 */
                            scope.$on('$destroy',function(){
                                ctrl.destroyData()
                            });

                            /*** 事件 ***/
                            /**
                             * 向 pNode 添加 nodes 及其子节点
                             * @param {Array} children
                             * @param {Object=} pNode
                             */
                            var registerNode = function (children, pNode) {
                                children = ctrl.transData(children, pNode);// 转换 children 为树形，配置树节点附加属性
                                if(pNode){
                                    pNode['children'] = pNode['children'] ?
                                        pNode['children'].concat(children) : children;
                                    pNode['__closed']=false;// 展开父节点
                                }else{// 根节点
                                    vm._data = vm._data.concat(children);
                                }
                            };
                            // 注销节点信息
                            var unregisterNode = function (node) {
                                var parent = node['__parent']
                                    ,children;
                                if(parent) {// 从 parent 的 children 中移除node
                                    children = parent['children'];
                                    children.splice(children.indexOf(node), 1);
                                    children.length==0 && (parent['children'] = undefined);
                                }else{// 根节点
                                    children = vm._data;
                                    children.splice(children.indexOf(node), 1);
                                }
                                ctrl.removeNode(node);
                            };

                            // 根据 node['__selected'] 设置其子节点选中状态
                            var setChildrenCheck=function(node) {
                                angular.forEach(node['children'], function (child) {
                                    child['__selected'] = node['__selected'];
                                    child['__semi'] = false;
                                    child['children'] && setChildrenCheck(child);// 级联孙子节点
                                });
                            };
                            // 根据子节点调整 node 选中状态
                            var setCheckByChildren=function(node) {
                                var count = 0;// 已选项总数
                                angular.forEach(node['children'], function (child) {
                                    child['__selected'] && count++;
                                });
                                if(count == 0){// 未选
                                    node['__selected'] = false;
                                    node['__semi'] = false;
                                }
                                else if(count == node['children'].length){// 全选
                                    node['__selected'] = true;
                                    node['__semi'] = false;
                                }
                                else{// 半选
                                    node['__selected'] = false;
                                    node['__semi'] = true;
                                }
                                node['__parent'] && setCheckByChildren(node['__parent']);// 可能影响父节点选中状态
                            };
                            // 展开 node
                            var expandNode=function(node){
                                if(!node['children'] || !node['__closed'] || conf.onbeforeexpand(node)===false) return;
                                node['__closed'] = false;// 展开
                                if(node['isbranch'] && !node['children'].length) {// 未展开的延迟加载节点
                                    node['__loading'] = true;
                                    conf.onloadbranch(node,function(children){
                                        // 延迟加载成功的回调函数
                                        node['__loading'] = false;
                                        if(angular.isArray(children)) {
                                            registerNode(children, node);
                                            scope.$apply();
                                        }
                                        conf.onexpand(node);
                                    },function(){
                                        // 延迟加载失败的回调函数
                                    });
                                }else{
                                    conf.onexpand(node);
                                }
                            };
                            // 折叠 node
                            var collapseNode=function(node){
                                if(!node['children'] || node['__closed'] || conf.onbeforecollapse(node)===false) return;
                                node['__closed'] = true;// 折叠
                                conf.oncollapse(node);
                            };
                            // 选中 node
                            var selectNode=function(node){
                                var oldStatus = node['__selected'];
                                if(oldStatus) return;// 已被选中，单选不作处理，多选时反转选中状态
                                if(conf.multiselect){
                                    if(conf.onbeforeselect(node)!==false){
                                        node['__selected'] = true;// 反选
                                        node['__semi'] = false;// 非半选
                                        if(conf.cascade){
                                            node['children'] && setChildrenCheck(node);// 级联子节点
                                            node['__parent'] && setCheckByChildren(node['__parent']);// 设置父节点状态
                                        }
                                        conf.onselect(node);
                                    }
                                    ctrl.changeCur(node);// 切换高亮
                                }else{
                                    if(conf.onbeforeselect(node)!==false){
                                        ctrl.changeSel(node);// 切换选中
                                        ctrl.changeCur(node);// 切换高亮
                                        conf.onselect(node);
                                    }
                                }
                            };

                            handler.clickRow = function(node){

                                if(node['__closed']){
                                    expandNode(node);
                                }else{
                                    collapseNode(node);
                                }
                                conf.onitemclick(node);

                                var oldStatus = node['__selected'];
                                if(oldStatus){// 已被选中，单选不作处理，多选时反转选中状态
                                    if(conf.multiselect){
                                        node['__selected'] = false;// 反选
                                        node['__semi'] = false;// 非半选
                                        if(conf.cascade){
                                            node['children'] && setChildrenCheck(node);// 级联子节点
                                            node['__parent'] && setCheckByChildren(node['__parent']);// 设置父节点状态
                                        }
                                        conf.oncancelselect(node);
                                        ctrl.changeCur(node);// 切换高亮
                                    }
                                }else{// 未被选中
                                    selectNode(node);
                                }
                            };

                            // 节点展开/闭合
                            handler.toggleNode = function (e,node) {
                                if(node['__closed']){
                                    expandNode(node);
                                }else{
                                    collapseNode(node);
                                }
                                e.stopPropagation();
                            };
                            // 切换悬停标记（node['wi-treehover']）
                            handler.toggleHover =function(node){
                                node['wi-treehover']=!node['wi-treehover'];
                            };

                            /* 开放接口，需定义双向绑定的 wid */
                            /**
                             * @ngdoc object
                             * @name ui.wisoft.tree.wid
                             * @module ui.wisoft.tree
                             * @description wiTree 对外开放的接口，双向绑定，使用前需在指令属性中指定 wid="xx"，并指定 scope.xx={}
                             */
                            if(attrs.wid && angular.isObject(scope.wid)) {
                                /**
                                 * @ngdoc method
                                 * @name ui.wisoft.tree.wid#options
                                 * @methodOf ui.wisoft.tree.wid
                                 * @description 获取当前树的配置
                                 * @return {Object} 返回一个包含用户自定义设置的对象。<br />
                                 * - idfield id字段.<br />
                                 * - pidfield parentid字段.<br />
                                 * - labelfield 显示字段.<br />
                                 * - cCls 叶子节点图标 class<br />
                                 * - pCls 父节点图标 class<br />
                                 * - cascade 是否级联父子节点的选中状态.<br />
                                 * - isTree 数据源是否为树形.<br />
                                 * - itemrenderer 自定义节点渲染.<br />
                                 * - multiselect 多选，false|true.<br />
                                 * - onbeforecollapse 节点折叠前的回调函数.<br />
                                 * - oncollapse 节点折叠时的回调函数.<br />
                                 * - onbeforeexpand 节点展开前的回调函数.<br />
                                 * - onexpand 节点展开时的回调函数.<br />
                                 * - onbeforeselect 节点选中前的回调函数.<br />
                                 * - oncancelselect 取消节点选中时的回调函数.<br />
                                 * - onitemclick 点击节点时的回调函数.<br />
                                 * - onloadbranch 加载延迟节点（isbranch=true 的节点）时的回调函数.<br />
                                 * - onselect 节点选中时的回调函数.
                                 */
                                scope.wid.options = function(){
                                    return conf;
                                };
                                /**
                                 * @ngdoc method
                                 * @name ui.wisoft.tree.wid#loadData
                                 * @methodOf ui.wisoft.tree.wid
                                 * @description 重置数据源
                                 * @param {Array} data 新的数据源
                                 * @param {boolean=} isTree data 是否为树形，默认为 false
                                 */
                                scope.wid.loadData = function(data, isTree){
                                    conf.isTree=isTree||false;
                                    scope.dataprovider = data;
                                };
                                /**
                                 * @ngdoc method
                                 * @name ui.wisoft.tree.wid#getNode
                                 * @methodOf ui.wisoft.tree.wid
                                 * @description 获取符合条件的第一个节点
                                 * @param {string} key 键
                                 * @param {Object} val 值
                                 * @return {Object} 第一个符合 data[key]=val 的节点 data，找不到时为 undefined.
                                 */
                                scope.wid.getNode = function(key, val){
                                    var _hashData = ctrl._hashData;
                                    for(var name in _hashData){
                                        if (_hashData.hasOwnProperty(name)){
                                            if (_hashData[name][key]==val) return _hashData[name];
                                        }
                                    }
                                };
                                /**
                                 * @ngdoc method
                                 * @name ui.wisoft.tree.wid#getNodes
                                 * @methodOf ui.wisoft.tree.wid
                                 * @description 获取符合条件的所有节点
                                 * @param {string} key 键
                                 * @param {Object} val 值
                                 * @return {Array} 所有符合 data[key]=val 的节点 data 组成的数组，找不到时为 [].
                                 */
                                scope.wid.getNodes = function(key, val){
                                    var _hashData = ctrl._hashData
                                        ,nodes=[];
                                    for(var name in _hashData){
                                        if (_hashData.hasOwnProperty(name)){
                                            if (_hashData[name][key]==val) nodes.push(_hashData[name]);
                                        }
                                    }
                                    return nodes;
                                };
                                /**
                                 * @ngdoc method
                                 * @name ui.wisoft.tree.wid#getSelected
                                 * @methodOf ui.wisoft.tree.wid
                                 * @description 获取选中的节点
                                 * @returns {Object | Array} 单选时为选中节点 data，无选中项时为 undefined；多选时为选中节点 data 组成的数组，无选中项时为 [].
                                 */
                                scope.wid.getSelected = function () {
                                    var _hashData = ctrl._hashData
                                        ,name;
                                    if (conf.multiselect) {
                                        var nodes=[];
                                        for(name in _hashData){
                                            if (_hashData.hasOwnProperty(name)){
                                                if (_hashData[name]['__selected']==true) nodes.push(_hashData[name]);
                                            }
                                        }
                                        return nodes;
                                    } else {
                                        for(name in _hashData){
                                            if (_hashData.hasOwnProperty(name)){
                                                if (_hashData[name]['__selected']==true) return _hashData[name];
                                            }
                                        }
                                    }
                                };
                                /**
                                 * @ngdoc method
                                 * @name ui.wisoft.tree.wid#select
                                 * @methodOf ui.wisoft.tree.wid
                                 * @description 选中指定节点
                                 * @param {object} node 要选中的节点 data
                                 */
                                scope.wid.select = function(node){
                                    selectNode(node);
                                };
                                /**
                                 * @ngdoc method
                                 * @name ui.wisoft.tree.wid#expandNode
                                 * @methodOf ui.wisoft.tree.wid
                                 * @description 展开指定节点
                                 * @param {object} node 要展开的节点 data
                                 */
                                scope.wid.expandNode = function(node){
                                    expandNode(node);
                                };
                                /**
                                 * @ngdoc method
                                 * @name ui.wisoft.tree.wid#collapseNode
                                 * @methodOf ui.wisoft.tree.wid
                                 * @description 折叠指定节点
                                 * @param {object} node 要折叠的节点 data
                                 */
                                scope.wid.collapseNode = function(node){
                                    collapseNode(node);
                                };
                                /**
                                 * @ngdoc method
                                 * @name ui.wisoft.tree.wid#append
                                 * @methodOf ui.wisoft.tree.wid
                                 * @description 向 parent 添加子节点 data
                                 * @param {Array} nodes 要添加的节点 data 数组（需要与 dataprovider 结构相同）
                                 * @param {object=} parent 添加到的节点 data，默认为根节点
                                 */
                                scope.wid.append = function (nodes, parent) {
                                    if (angular.isArray(nodes)) {
                                        registerNode(nodes, parent);
                                        scope.$evalAsync();// 不使用apply，可能由外部ng-事件或$watch触发
                                    }
                                };
                                /**
                                 * @ngdoc method
                                 * @name ui.wisoft.tree.wid#remove
                                 * @methodOf ui.wisoft.tree.wid
                                 * @description 删除节点 node，及其子节点
                                 * @param {object} node 添加到的节点 data
                                 */
                                scope.wid.remove = function (node) {
                                    unregisterNode(node);
                                };
                                /**
                                 * @ngdoc method
                                 * @name ui.wisoft.tree.wid#updateNode
                                 * @methodOf ui.wisoft.tree.wid
                                 * @description 重置指定节点设置
                                 * @param {object} node 要重置的节点 data
                                 * @param {object} options 节点设置
                                 */
                                scope.wid.updateNode = function(node, options){
                                    angular.extend(node, options);
                                };
                            }
                        }
                        /*** 子节点 ***/
                        else{
                            /* 数据源监听 */
                            scope.$watch('dataprovider', function (newValue) {
                                if(newValue) {
                                    vm._data = scope.dataprovider;
                                }
                            },false);
                        }
                    }
                });
            }
        };
    }]);
