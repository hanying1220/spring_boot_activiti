/**
 * @ngdoc overview
 * @name ui.wisoft.tabset
 *
 * @description
 * Tab标签组件
 */
'use strict';
angular.module('ui.wyy.tabset', ['ui.wyy.resizelistener','ui.wyy.common','ui.wyy.menu'])
    .constant('tabsetConf',{
        'liBefore': 2 // li: margin-right: 2px
    })
    .controller('TabsetController', ['$scope','$attrs','$timeout','tabsetConf', function($scope,$attrs,$timeout,tabsetConf) {
        var conf = $scope.conf = {
            vertical: $attrs.hasOwnProperty('vertical') && $attrs['vertical']!='false'// 是否是纵向 tabset - tab 添加需知道 tabset 的方向，故在 controller 中判断
            ,closeable: !$attrs.hasOwnProperty('closeable') || $attrs['closeable']!='false'// 是否允许关闭，对所有非固定 tab 生效
        };
        var ctrl = this
            ,attrNames = ctrl.attrNames = conf.vertical ? // 确定横向、纵向要操作的 DOM 属性
            { offset: 'offsetHeight', pos: 'top', size:'height'}:// offsetHeight 包括边框
            { offset: 'offsetWidth', pos: 'left', size:'width'}
            ,tabs = $scope.tabs = [] //tab 的 scope 集合
            ,tabSizes = ctrl.tabSizes = []; // tab 的 size 集合
        ctrl.sumSize = 0; // 记录应显示的 li 的总 size
        ctrl.rightClickTab = undefined;//右击时选中的tab对象

        // 取消选中其他 tab 页
        ctrl.deselectOthers = function(selectedTab) {
            angular.forEach(tabs, function(tab) {
                if (tab.active && tab !== selectedTab) {
                    tab.active = false;
                }
            });
        };

        // 新增标签页 - 当前 tab 的 scope 和 jqlite 元素
        ctrl.addTab = function(tab, elm) {
            var liBefore = (tabs.length > 0) ? tabsetConf.liBefore : 0;// 不是第一项，附加相邻 tab 间的 margin
            var index=tabs.length;
            if(ctrl.acLinked){// 需要判断 DOM 索引
                var children=elm[0].parentElement.children;
                while(index<children.length){
                    if(children[index++] == elm[0]) break;
                }
            }
            tabs.splice(index, 0, tab);
            // 允许关闭时，不可禁用，disable=false；禁止关闭时，disable=undef
            conf.closeable && (tab.disable = false);
            // tab 是选中项
            (tab.active && !tab.disable) && ctrl.deselectOthers(tab);

            // 延迟以确保 wi-tabset 指令中 $scope.scrollChange 已定义，判断防止获取不到新 tab 的尺寸
            $timeout(function(){
                $scope.$apply($scope.ulStyle[attrNames['size']]='auto');// 避免由于容器不足无法获取实际尺寸
                var size = elm[0].getBoundingClientRect()[attrNames.size]; // 获取精确 size - chrome 中精确显示
                tabSizes.splice(index, 0, size);
                ctrl.sumSize += liBefore + size;
                $scope.scrollChange && $scope.scrollChange();
            });
        };

        // 关闭 tab
        ctrl.removeTab = function(tab) {
            var index = tabs.indexOf(tab);
            // 当前项被选中，先修改选中项
            if(tab.active && tabs.length > 1) {
                tabs[index == tabs.length - 1 ? //当前项为最后一项
                    index - 1: index + 1].active = true;
            }
            // 移除 tab
            tab.active = false;
            tabs.splice(index, 1);
            tabs.length && (ctrl.sumSize -= tabsetConf.liBefore);
            ctrl.sumSize -= tabSizes[index];
            tabSizes.splice(index, 1);
            tab.$destroy();// 销毁 - 触发 tab 中定义的 $destroy 监听，移除 dom
            $scope.scrollable = false;// 删除后可能无需翻页，先置为 false 再计算显示空间
            $timeout(function() {
                // 延迟以等待 scrollable 生效，以获得最大的 stage 尺寸
                $scope.scrollChange && $scope.scrollChange();
            });
            return true;
        };

        // 关闭所有标签页 - closeable 的项
        ctrl.closeAllTab = function() {
            var i = 0;
            while(i<tabs.length){
                (tabs[i]._closeable) ?
                    ctrl.removeTab(tabs[i]) :
                    i++;
            }
        };
        // 关闭除 tab 外的所有标签页 - 非 regular 项
        ctrl.closeOtherTab = function(tab) {
            var i = 0;
            while(i<tabs.length){
                (tabs[i] != tab && tabs[i]._closeable) ? // 不是 tab 且可删除，移除，否则索引向后
                    ctrl.removeTab(tabs[i]) :
                    i++;
            }
        };

        ctrl.calcUlOffset = function(){
            $scope.calcUlOffset();
        };
    }])

/**
 * @ngdoc directive
 * @name ui.wisoft.tabset.directive:wiTabset
 * @restrict E
 *
 * @description
 * 标签页组件标签，内部可包含wiTab标签页定义
 *
 * @param {number|length=} width 组件宽度，默认为 100%。<br />
 *   number 将自动添加单位 px。<br />
 *   length 为 number 接长度单位（相对单位和绝对单位）。<br />
 *   相对单位：em, ex, ch, rem, vw, vh, vm, %<br />
 *   绝对单位：cm, mm, in, pt, pc, px
 * @param {number|length=} height 组件高度，默认由内容撑开。<br />
 *   说明同 width。
 * @param {boolean=} vertical 标签页是否纵向排列，默认为 false。
 * @param {pixels=} tabheadsize 标签页头高度（纵向为宽度）(不含单位：px)，默认为 36。
 * @param {boolean=} closeable 所有标签（非固定）支持关闭，默认为 true，此时不支持禁用标签（wi-tab 中 disable 属性失效）。
 * @param {boolean=} enablerightmenu 是否启用标签页右键菜单，默认为 false。若 closeable=false，此属性失效。
 * @param {object=} wid 若定义了此属性，可供调用接口。调用方法参见：wid.
 * @param {function=} onbeforeclose 关闭标签页前的回调方法名，该方法若返回 false 将阻止关闭，参数为标签对应的 data：
 * - wiid: 初始化 wi-tab 指令时设置的 wiid 属性值
 * - src: 初始化 wi-tab 指令时设置的 src 属性值
 * - icon: 初始化 wi-tab 指令时设置的 src 属性值
 * - heading: 初始化 wi-tab 指令时设置的 heading 属性值，或 wi-tab-heading 中的html字符串
 * @param {function=} onclose 关闭标签页后的回调方法名，参数同 onbeforeclose.
 * @param {function=} onselect 标签选中后的回调方法名，返回 false 时将阻止关闭，参数同 onbeforeclose.
 */
    .directive('wiTabset', ['wiResizeListener','wiCommonSev', '$timeout', 'tabsetConf',function(wiResizeListener,wiCommonSev,$timeout, tabsetConf) {
        return {
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: {
                wid:'='
                ,onselect: '&'
                ,onbeforeclose: '&'
                ,onclose: '&'
            },
            controller: 'TabsetController',
            templateUrl: 'app/components/wyy/template/tabsetTemplate.html',
            link: function(tabset, element, attrs, tabsetCtrl) {
                var parentScope = tabset.$parent
                    ,conf=tabset.conf
                    ,attrNames = tabsetCtrl.attrNames
                    ,tabSizes = tabsetCtrl.tabSizes;
                tabset.scrollable = false;// 初始默认不翻页
                var menudata = [
                        {id:1,label:'关闭当前页'},
                        {id:2,label:'关闭其他'},
                        {id:3,label:'关闭所有'}
                    ] // 非 regular 项弹出菜单
                    ,menudataRegular = [
                        {id:1,label:'关闭当前页', enabled: false},
                        {id:2,label:'关闭其他'},
                        {id:3,label:'关闭所有'}
                    ] // regular 项弹出菜单
                    ,menudataOut =[
                        {id:3,label:'关闭所有'}
                    ]; // 非 tab 项弹出菜单
                var stageNode // wi-tabstage 对应的 DOM 元素
                    ,_ulOffset = 0;// ul 默认偏移 - 范围：[stageSize-ceil(sumSize),0]
                tabsetCtrl.selectFun = tabset.onselect() || angular.noop; // 选中后的回调方法
                tabsetCtrl.beforeCloseFun = tabset.onbeforeclose() || angular.noop; // 关闭前的回调方法
                tabsetCtrl.closeFun = tabset.onclose() || angular.noop; // 关闭后的回调方法

                angular.extend(conf,{
                    width:wiCommonSev.getSizeFromAttr(attrs['width'],parentScope)
                    ,height:wiCommonSev.getSizeFromAttr(attrs['height'],parentScope)
                    ,tabheadsize:Number(attrs['tabheadsize']) || 40
                    ,enablerightmenu:conf.closeable ? // 是否支持右键菜单，若禁止关闭，则禁用右键菜单
                        attrs.hasOwnProperty('enablerightmenu') && attrs['enablerightmenu']!='false'
                        : false
                    ,onselect: tabsetCtrl.selectFun
                    ,onbeforeclose: tabsetCtrl.beforeCloseFun
                    ,onclose: tabsetCtrl.closeFun
                });
                tabset.ulStyle={};
                angular.forEach(angular.element(element.children()[0]).children(),function(child){
                    if((' ' + child.className +  ' ').indexOf('wi-tabstage') >= 0){
                        stageNode = child;
                        // 根据右击的 tab 修改菜单数据源 - 会在 menu 中绑定的右击事件前触发
                        angular.element(child).on('contextmenu', function(){
                            if(tabsetCtrl.isTab){// 右击的是 tab 页
                                var rightTab = tabsetCtrl.rightClickTab && tabsetCtrl.rightClickTab.scope;// 右击的 tab 的 tabset
                                tabset.menudata = rightTab._closeable ? menudata : menudataRegular;
                            }else{
                                tabset.menudata = menudataOut;
                            }
                            tabset.$digest();// 引起 menu 组件中数据源变化
                            tabsetCtrl.isTab = false;
                        });
                    }
                });

                // scrollChange 判断，纵向未指定高度时会自适应高度，无需处理
                if(!conf.vertical || conf.height){
                    tabset.ulStyle['transition']=attrNames['pos']+" .35s ease";// 滚动时支持动画
                    tabset.ulStyle['-webkit-transition']=attrNames['pos']+" .35s ease";
                    // 判断并修改 scrollable，置为 true 后还需根据 active 的项调整 ulOffset
                    tabset.scrollChange = function(){// 判断 scrollable
                        var stageSize = stageNode[attrNames.offset];
                        tabset.ulStyle[attrNames['size']]=Math.ceil(tabsetCtrl.sumSize)+'px';
                        if(stageSize && stageSize < tabsetCtrl.sumSize){// 空间不足
                            tabset.scrollable = true;
                            $timeout(function(){
                                tabset.calcUlOffset();
                            });
                        }else{
                            _ulOffset = 0;// 清空 ul 定位
                            tabset.ulStyle[attrNames['pos']]=_ulOffset+'px';
                            tabset.scrollable = false;
                        }
                    };
                }

                // 根据 active 的 tab 调整 ulOffset - 只有翻页状态下需要判断，切换选中项时只需调整 ulOffset，不需调整 scrollable
                tabset.calcUlOffset = function(){
                    if(!tabset.scrollable) return;
                    var preSize = 0 // active 项之前的 tab 的总 size（含 margin）
                        ,size = 0;// active 的 tab 的 size（不含 margin）
                    for(var i= 0;i<tabSizes.length;i++){
                        size = tabSizes[i];
                        if(tabset.tabs[i].active){// 选中项
                            break;
                        }
                        preSize += size + tabsetConf.liBefore;
                    }
                    // 根据 presize 及 size 调整 _ulOffset
                    var stageSize = stageNode[attrNames.offset]
                        ,min = Math.max(-Math.floor(preSize),stageSize-Math.ceil(tabsetCtrl.sumSize))
                        ,max = Math.min(stageSize-Math.ceil(preSize+size),0);
                    if(_ulOffset < min){
                        _ulOffset = min;
                    }else if(_ulOffset > max){
                        _ulOffset = max;
                    }
                    tabset.ulStyle[attrNames['pos']]=_ulOffset+'px';
                };

                // 右键菜单选中事件，选中项为 val
                tabset.rightmenuselect = function(val) {
                    var tab = tabsetCtrl.rightClickTab;
                    if(val){
                        if (val.id == 1) {// 关闭当前项
                            tab && tabsetCtrl.removeTab(tab.scope);
                        } else if (val.id == 2) {// 关闭其他项
                            tab && tabsetCtrl.closeOtherTab(tab.scope);
                        } else if (val.id == 3) {// 关闭所有
                            tabsetCtrl.closeAllTab();
                        }
                    }
                };

                // 向前显示一个 tab
                tabset.backward = function() {
                    var oldPos = _ulOffset;
                    if(oldPos >= 0) return; // 左/上无被隐藏项，直接返回
                    var preSize = 0 // 当前 tab 前的 tab 的总 size（含 margin）
                        ,size = 0 // 要显示的 tab 的 size（不含 margin）
                        ,_preSize = 0;
                    for(var i=0;i<tabSizes.length;i++){
                        if(-oldPos <= Math.floor(preSize)){// 第一个未被遮挡的项
                            _ulOffset = -Math.floor(_preSize);// 上一项为要显示的项
                            tabset.ulStyle[attrNames['pos']]=_ulOffset+'px';
                            break;
                        }
                        size = tabSizes[i];
                        _preSize = preSize;
                        preSize += (size + tabsetConf.liBefore);
                    }
                };
                // 向后显示一个 tab
                tabset.forward = function() {
                    var oldPos = _ulOffset
                        ,stageSize = stageNode[attrNames.offset];
                    if(oldPos <= stageSize - Math.ceil(tabsetCtrl.sumSize)) return; // 右/下未无被隐藏项，直接返回
                    var preSize = 0; // 当前 tab 及之前的 tab 的总 size（含 margin）
                    for(var i=0;i<tabSizes.length;i++){
                        preSize += tabSizes[i];
                        if(stageSize-oldPos < Math.ceil(preSize)){// 第一个超出 stage 的项
                            _ulOffset = stageSize - Math.ceil(preSize);
                            tabset.ulStyle[attrNames['pos']]=_ulOffset+'px';
                            break;
                        }
                        preSize += tabsetConf.liBefore;
                    }
                };

                var resetSize = tabsetCtrl.resetSize = function(){
                    var tabs = tabset.tabs;
                    $timeout(function(){
                        tabset.$apply(tabset.ulStyle[attrNames['size']]='auto');
                        for(var i=0;i<tabs.length;i++){
                            var size=tabs[i].getSize();
                            var oldSize = tabsetCtrl.tabSizes[i];
                            if(size == oldSize) continue;
                            tabsetCtrl.tabSizes[i]=size;
                            tabsetCtrl.sumSize += size;
                            oldSize && (tabsetCtrl.sumSize -= oldSize);
                        }
                        tabset.scrollChange && tabset.scrollChange();
                    });
                };

                var regResizeEventListener = function(){
                    wiResizeListener.addResizeListener(element[0].parentElement, function(){
                        tabset.$evalAsync(resetSize);
                    });
                };
                if((conf.vertical && conf.height && conf.height.indexOf('%')>0)
                    || (!conf.vertical && conf.width && conf.width.indexOf('%')>0)){
                    // tabset 父容器或者窗口尺寸变化时重新调整布局 -- 需在模板和文档都设置完成后运行，否则 IE 等浏览器显示异常
                    regResizeEventListener();
                }

                /* 开放接口，需定义双向绑定的 wid */
                /**
                 * @ngdoc object
                 * @name ui.wisoft.tabset.wid
                 * @module ui.wisoft.tabset
                 * @description wiTabset 对外开放的接口，双向绑定，使用前需在指令属性中指定 wid="xx"，并指定 tabset.xx={}
                 */
                if(attrs.wid && angular.isObject(tabset.wid)) {
                    angular.extend(tabset.wid, {
                        /**
                         * @ngdoc method
                         * @name ui.wisoft.tabset.wid#options
                         * @methodOf ui.wisoft.tabset.wid
                         * @description 获取当前tabset的配置
                         * @return {Object} 返回一个包含用户自定义设置的对象。<br />
                         * - width 组件宽度.<br />
                         * - height 组件高度.<br />
                         * - vertical 标签页是否纵向排列.<br />
                         * - tabheadsize 标签页头高度（纵向为宽度）(单位：px).<br />
                         * - closeable 所有标签（非固定）支持关闭.<br />
                         * - enablerightmenu 是否启用标签页右键菜单.<br />
                         * - onbeforeclose 关闭标签页前的回调方法.<br />
                         * - onclose 关闭标签页后的回调方法.<br />
                         * - onselect 标签选中后的回调方法.
                         */
                        options: function () {
                            return conf;
                        }
                        /**
                         * @ngdoc method
                         * @name ui.wisoft.tabset.wid#getTab
                         * @methodOf ui.wisoft.tabset.wid
                         * @description 获取符合条件的第一个 tab 的 scope
                         * @param {string} key 键，可选值：'wiid','src','icon','heading'
                         * @param {Object} val 值
                         * @return {Object} 第一个符合 tab[key]=val 的 scope，找不到时为 undefined.
                         */
                        ,getTab: function (key, val) {
                            var tabs = tabset.tabs;
                            for(var i=0;i<tabs.length;i++){
                                if(tabs[i].getData()[key]==val) return tabs[i];
                            }
                        }
                        /**
                         * @ngdoc method
                         * @name ui.wisoft.tabset.wid#getTabs
                         * @methodOf ui.wisoft.tabset.wid
                         * @description 获取符合条件的所有 tab 的 scope
                         * @param {string} key 键，可选值：'wiid','src','icon','heading'
                         * @param {Object} val 值
                         * @return {Array} 所有符合 tab[key]=val 的 scope 组成的数组，找不到时为 [].
                         */
                        ,getTabs: function (key, val) {
                            var tabs = tabset.tabs
                                ,res=[];
                            for(var i=0;i<tabs.length;i++){
                                if(tabs[i].getData()[key]==val) res.push(tabs[i]);
                            }
                            return res;
                        }
                        /**
                         * @ngdoc method
                         * @name ui.wisoft.tabset.wid#getActiveTab
                         * @methodOf ui.wisoft.tabset.wid
                         * @description 获取当前选中的 tab 的 scope
                         * @return {Object} 当前选中的 tab 的 scope，找不到时为 undefined.
                         */
                        ,getActiveTab: function () {
                            var tabs = tabset.tabs;
                            for(var i=0;i<tabs.length;i++){
                                if(tabs[i].active == true) return tabs[i];
                            }
                        }
                        /**
                         * @ngdoc method
                         * @name ui.wisoft.tabset.wid#select
                         * @methodOf ui.wisoft.tabset.wid
                         * @description 选中指定的 tab
                         * @param {Object} tab 要选中的 tab 的 scope
                         */
                        ,select: function (tab) {
                            if(tab) tab.active=true;
                        }
                        /**
                         * @ngdoc method
                         * @name ui.wisoft.tabset.wid#close
                         * @methodOf ui.wisoft.tabset.wid
                         * @description 关闭指定的 tab
                         * @param {Object} tab 要关闭的 tab 的 scope
                         */
                        ,close: function (tab) {
                            if(tab) tab.close();
                        }
                        /**
                         * @ngdoc method
                         * @name ui.wisoft.tabset.wid#reCompute
                         * @methodOf ui.wisoft.tabset.wid
                         * @description 重新根据容器尺寸调整布局，在容器resize或显示时需手动触发
                         */
                        ,reCompute: function () {
                            regResizeEventListener();
                        }
                    });
                }

                // 标识是否完成 link，此后 link 的 accordionGroup （ng-repeat 等造成）需判断在 DOM 中的位置
                tabsetCtrl.acLinked = true;
            }
        };
    }])

/**
 * @ngdoc directive
 * @name ui.wisoft.tabset.directive:wiTab
 * @restrict E
 *
 * @description
 * 单个标签页定义标签，只能在wiTabset标签内使用
 *
 * @param {string=} wiid 标签标识id
 * @param {string=} heading 标签头内容，可以是一个字符串或一段HTML
 * @param {boolean=} active 标签初始时是否被选中，默认为 false，若要通过其他方式改变 active 的值，需为 active 指定有意义的初始值
 * @param {boolean=} disable 标识标签是否禁用，默认为 false。<br />wi-tabset 若未定义 closeable=false，此属性失效。
 * @param {boolean=} regular 是否是固定标签，默认为false。添加此属性且不设置为 false，则为固定 tab，不可关闭。<br />wi-tabset 若定义 closeable=false，此属性失效。
 * @param {string=} icon 标签页图标的 url
 * @param {string=} src 标签页内容链接地址，若定义此属性，wi-tabset 中原有的
 * @param {number|length=} size 组件宽度（纵向 tabset 为高度），默认由内容撑开。<br />
 *   number 将自动添加单位 px。<br />
 *   length 为 number 接长度单位（相对单位和绝对单位）。<br />
 *   相对单位：em, ex, ch, rem, vw, vh, vm, %<br />
 *   绝对单位：cm, mm, in, pt, pc, px
 */
    .directive('wiTab', ['$parse','wiCommonSev', function($parse,wiCommonSev) {
        return {
            require: '^wiTabset',
            restrict: 'E',
            replace: true,
            templateUrl: 'app/components/wyy/template/tabTemplate.html',
            transclude: true,
            scope: {
                heading: '@'
            },
            controller: function() {
            },
            compile: function(elm, attrs, transclude) {
                return function postLink(tab, elm, attrs, tabsetCtrl) {
                    tab.$transcludeFn = transclude;
                    var parentScope = tab.$parent;
                    tab.data={
                        wiid:attrs.wiid
                        ,src:attrs.src
                        ,icon:attrs.icon
                    };
                    elm.css(tabsetCtrl.attrNames.size, wiCommonSev.getSizeFromAttr(attrs['size']));

                    var _setActive;
                    if (attrs.active) {// 有 active 属性，监听
                        var _getActive = $parse(attrs.active);
                        _setActive = _getActive.assign;
                        tab.active = _getActive(parentScope);
                        _setActive && parentScope.$watch(_getActive, function(val, wasVal) {
                            if(val !== wasVal) tab.active = val;
                        });
                    }
                    else{
                        tab.active = false;
                    }
                    // 监听选中状态
                    tab.$watch('active', function(active, wasActive) {
                        if(active === wasActive) return;
                        if(_setActive){
                            _setActive(parentScope, active);// 同时修改数据源
                        }
                        if (active) {
                            tabsetCtrl.deselectOthers(tab);// 取消选中其他 tab
                            tabsetCtrl.calcUlOffset();
                            tabsetCtrl.selectFun(tab.getData());
                        }
                    });

                    /* ----- 向 tabset 中添加 ----- */
                    tabsetCtrl.addTab(tab, elm);
                    // addTab 之后执行
                    if(tab.disable === false){// tabset 中 closeable=true 时，此 tab 可以关闭，不可禁用
                        if (attrs.regular) {// 有 regular 属性，监听，非 regular 的标签可关闭
                            var _getRegular = $parse(attrs.regular);
                            tab._closeable = !_getRegular(parentScope);
                            _getRegular.assign && parentScope.$watch(_getRegular, function(val, wasVal) {
                                if(val !== wasVal){
                                    tab._closeable = !val;
                                    tabsetCtrl.resetSize();// 切换显示关闭按钮将改变当前 tab 的尺寸，需重新计算
                                }
                            });
                        }else{
                            tab._closeable = true;
                        }
                    }
                    else{// tabset 中 closeable=false 时，不可关闭，可以禁用
                        tab._closeable = false;
                        tab.disable = false;
                        if(attrs.disable){
                            var _getDisabled = $parse(attrs.disable);
                            _getDisabled.assign && parentScope.$watch(_getDisabled, function(value) {
                                tab.disable = !! value;
                            });
                        }
                    }

                    // 返回当前 tab 的数据
                    tab.getData = function(){
                        return angular.extend({
                            heading: tab.heading || tab.headingElem
                        },tab.data);
                    };

                    tab.getSize = function(){
                        return elm[0].getBoundingClientRect()[tabsetCtrl.attrNames.size];
                    };

                    tab.select = function() {
                        if ( !tab.disable ) {
                            tab.active = true;
                        }
                    };

                    tab.close = function(event) {
                        if(tabsetCtrl.beforeCloseFun(tab.getData())!==false){
                            tabsetCtrl.removeTab(tab, elm);
                        }
                        event && event.stopPropagation();// 防止触发 tab 的 click 事件
                    };

                    tab.$on('$destroy', function() {
                        elm && elm.remove();
                        tabsetCtrl.closeFun(tab.getData());// 删除后有回调函数的调用回调函数
                        tab = undefined;
                    });

                    // 捕捉右键菜单弹出的 tab
                    elm.on('contextmenu', function(){
                        tabsetCtrl.rightClickTab = {
                            scope: tab
                            ,elm: elm
                        };
                        tabsetCtrl.isTab = true;// 标识右击了 tab
                    });
                };
            }
        };
    }])

    .directive('wiTabHeadingTransclude', [function() {
        return {
            restrict: 'A',
            require: '^wiTab',
            link: function(scope, elm) {
                scope.$watch('headingElem', function updateHeadingElem(heading) {
                    if (heading) {
                        elm.html(heading);
                    }
                });
            }
        };
    }])

    .directive('wiTabContentTransclude', function() {
        return {
            restrict: 'A',
            require: '^wiTabset',
            link: function(scope, elm, attrs) {
                var tab = scope.$eval(attrs.wiTabContentTransclude);
                tab.$transcludeFn(tab.$parent, function(contents) {
                    angular.forEach(contents, function(node) {
                        if (isTabHeading(node)) {
                            tab.headingElem = angular.element(node).html();
                        } else if (tab.src == undefined) {
                            elm.append(node);
                        }
                    });
                });
            }
        };
        /**
         * @ngdoc directive
         * @name ui.wisoft.tabset.directive:wiTabHeading
         * @restrict E
         *
         * @description
         * 用于自定义标签页头，只能用于wiTab标签内<br>
         * 示例：<br>
         * &lt;wi-tab&gt;<br>
         *     &lt;wi-tab-heading&gt;&lt;b style="color:red;"&gt;自定义标签名称&lt;/b&gt;&lt;/wi-tab-heading&gt;<br>
         *      ......<br>
         * &lt;/wi-tab&gt;<br>
         */
        function isTabHeading(node) {
            return node.tagName && node.tagName.toLowerCase() === 'wi-tab-heading';
        }
    });
