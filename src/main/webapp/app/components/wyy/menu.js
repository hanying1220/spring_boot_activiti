/**
 Created by QianQi on 2014/9/5.
 */
angular.module('ui.wyy.menu', ['ui.wyy.position','ui.wyy.popup'])
    .constant('menuConf', {
        divBorderSize: 1// wi-menu-item 边框
        ,emptyUlHeight: 6// 空 wi-menu-item > ul 高度
        ,toolbarHeight: 29// toolbar 高度
        ,liHeight: 25// 内容 li 高度
        ,liWidth: 160// li 宽度（不含 ul 分隔线 1px）
        ,subOffset: 5// 子菜单水平偏移
        ,scollbarSize: 17// 滚动条留白 --  与 position 服务中滚动条留白尺寸一致
    })

/**
 * @ngdoc directive
 * @name ui.wisoft.menu.directive:wiMenu
 * @restrict E
 *
 * @description
 * wiMenu 是菜单，其中可以包含一个 DOM 元素以触发弹出固定菜单。
 *
 * @param {boolean=} wiRightMenu 右键菜单标识。固定位置的菜单可省略此属性，或设置为"false"。
 * @param {string=} position 固定位置的菜单弹出方向，右键菜单此属性无效。<br />
 * 默认为 "bottom-left"。可选值：<br />
 * "bottom-left"/"bottom-right"/"top-left"/"top-right"/"left-top"/"left-bottom"/"right-top"/"right-bottom"
 * @param {boolean=} adaptable 第一级菜单是否根据 DOM 可视区域调整弹出方向，默认为 true。
 * @param {boolean=} filterable 第一级菜单是否可根据关键字筛选，默认为 false。
 * @param {JSON} dataprovider 菜单数据源，绑定项，只能根据当前 scope 中的变量控制。数据项：<br />
 * id: string  菜单项 id<br />
 * label: string  菜单项显示内容<br />
 * icon: string  可选，菜单项自定义图标<br />
 * filterable: boolean  可选，子菜单是否支持搜索<br />
 * children: []  可选，子菜单数据源<br />
 * enabled: boolean  可选，菜单项是否可用<br />
 * event: string  可选，可直接执行的表达式（复杂事件根据点击后的选中菜单项自定义）
 * @param {object=} selectitem 整个菜单中选中的数据项，绑定项，只能根据当前 scope 中的变量控制 - 将删除此方法。
 * @param {function=} onselect 选中菜单项后执行的自定义方法，参数为选中项。
 *
 */
    .directive('wiMenu', ['$compile','popupService','$document','$window','$timeout','menuConf','$filter','$position', function($compile,popupService,$document,$window,$timeout,menuConf,$filter,$position){
        return{
            restrict: 'E',
            templateUrl: 'app/components/wyy/template/wi-menu.html',
            replace: true,
            transclude: true,
            scope: {
                dataprovider: '='// 数据源
                ,selectitem: '='// 选中项
                ,onselect: '&'// 选中项后执行的方法
            },
            require: 'wiMenu',
            controller: ['$scope', '$attrs', function($scope, $attrs){
                var ctrl = this;
                ctrl.select = ($attrs.hasOwnProperty('selectitem')) ?
                    function(item){
                        $scope.selectitem = item;
                    } :
                    angular.noop;
            }],
            compile: function(telem, tattrs, transclude){
                var compiledContents// 编译后的内容
                    ,contents = telem.contents().remove();
                return{
                    post: function(scope, elem, attrs, ctrl){
                        compiledContents || (compiledContents = $compile(contents));// 编译内容
                        compiledContents(scope, function(clone){// 重新添加内容
                            elem.append(clone);
                        });
                        var conf = scope.conf = {
                            adaptable: (attrs.adaptable != 'false')// 一级菜单是否根据文档可见区域调整弹出方向，默认为 true
                            ,filterable: (attrs.filterable == 'true')// 是否可过滤，默认为 false
                        };
                        scope.menutype = scope.$parent.menutype ?
                            'sub' :
                            (attrs.hasOwnProperty('wiRightMenu') && attrs['wiRightMenu'] != "false") ?
                                'right' : 'static';
                        scope.isOpen = false;
                        var data = scope.dataprovider || [];
                        scope.datagroups = data.length ? [data] : [];// 记录分栏信息
                        scope.groupsBackward = [];
                        scope.groupsForward = [];

                        var referElem// 定位参照元素-jqlite
                            ,rePosition = angular.noop// 定位函数
                            ,targetElWidth// 要弹出的菜单的实际宽度
                            ,targetElHeight;// 数据不分栏总高度（若可搜索，包含 toolbar 高度）
                        if(scope.menutype == 'sub'){
                            var className = '';
                            referElem = elem.parent();// 参照元素为父菜单项
                            // 监听 isOpen 属性，关闭时关闭所有子项
                            attrs.$observe( 'isOpen', function () {
                                scope.isOpen = (attrs.isOpen == 'true');
                            });

                            rePosition = function(){
                                elem.removeClass(className);// 移除定位 class
                                var viewElPos// 触发元素相对文档可见区域位置（含尺寸）
                                    ,pos0 = 'right', pos1 = 'top'// 子菜单默认弹出方向为 right-top
                                    ,viewW = $window.innerWidth - menuConf.scollbarSize
                                    ,viewH = $window.innerHeight - menuConf.scollbarSize;// 文档可见区域尺寸，为滚动条留白 menuConf.scollbarSize
                                targetElWidth = menuConf.liWidth + menuConf.divBorderSize * 2;// 初始化为不分栏的宽度
                                targetElHeight = (menuConf.emptyUlHeight + 2 * menuConf.divBorderSize) + data.length * menuConf.liHeight;// 初始化为数据不分栏总高度（若可搜索，包含 toolbar 高度）
                                (conf.filterable) && (targetElHeight += menuConf.toolbarHeight);// 是否显示过滤
                                viewElPos = referElem[0].getBoundingClientRect();

                                // 若允许自适应，则根据需要分栏，确定实际尺寸
                                (conf.adaptable != false) && manageSubs(Math.max(viewElPos.left, viewW - viewElPos.right) + menuConf.subOffset, viewH);
                                var positionObj = $position.adaptElements(referElem, targetElWidth, targetElHeight, pos0 + '-' + pos1, conf.adaptable, false);

                                className = 'wi-menu-' + positionObj[1];
                                elem.addClass(className)
                                    .css(angular.extend(positionObj[0],{
                                        'width': targetElWidth + 'px'
                                        ,'height': targetElHeight + 'px'
                                    }));
                            };
                            scope.ctrl = scope.$parent.ctrl;
                        }
                        else{
                            if(scope.menutype == 'static'){
                                conf.position = attrs.position ? attrs.position : 'bottom-left'; //一级菜单默认弹出方向
                                angular.forEach(transclude(scope), function(el){// 参照元素为切换显示/隐藏的 jqLite 元素
                                    (el.nodeType == 1) && (referElem = angular.element(el));
                                });
                                if(!referElem){
                                    referElem = angular.element('<input type="button" class="wi-btn" value="弹出菜单" />');
                                }
                                referElem.on('click', function(event){
                                    if(scope.isOpen == true){
                                        scope.isOpen = false;
                                        popupService.close(scope);
                                    }else{
                                        scope.isOpen = true;
                                        popupService.open(scope, true);
                                        elem.css('zIndex',$position.getZIndex());// 获取 z-index，使 menu 在最上层
                                    }
                                    scope.$digest();
                                    event.stopPropagation();
                                });
                                elem.parent().prepend(referElem);
                                attrs.$observe( 'position', function () {// 监听菜单位置
                                    conf.position = attrs.position;
                                });

                                rePosition = function(){
                                    var viewElPos// 触发元素相对文档可见区域位置（含尺寸）
                                        ,pos0
                                        ,elemStyle// 菜单样式
                                        ,viewW = $window.innerWidth - menuConf.scollbarSize
                                        ,viewH = $window.innerHeight - menuConf.scollbarSize;// 文档可见区域尺寸，为滚动条留白 menuConf.scollbarSize
                                    targetElWidth = menuConf.liWidth + menuConf.divBorderSize * 2;// 初始化为不分栏的宽度
                                    targetElHeight = (menuConf.emptyUlHeight + 2 * menuConf.divBorderSize) + data.length * menuConf.liHeight;// 初始化为数据不分栏总高度（若可搜索，包含 toolbar 高度）
                                    (conf.filterable) && (targetElHeight += menuConf.toolbarHeight);// 是否显示过滤
                                    viewElPos = referElem[0].getBoundingClientRect();

                                    var positionStrParts = angular.isString(conf.position) ? conf.position.split('-') : [];
                                    pos0 = positionStrParts[0] || 'bottom';
                                    // 若允许自适应，则根据需要进行分栏并调整弹出方向
                                    if(conf.adaptable != false) {
                                        // 根据一级方向分栏，确定实际尺寸
                                        if(['left', 'right'].indexOf(pos0) >= 0){
                                            manageSubs(Math.max(viewElPos.left, viewW - viewElPos.right), viewH);
                                        }else{
                                            manageSubs(viewW, Math.max(viewElPos.top, viewH - viewElPos.bottom));
                                        }
                                    }
                                    // 调用 $position 服务确定弹出方向和位置
                                    elemStyle = $position.adaptElements(referElem, targetElWidth, targetElHeight, conf.position, conf.adaptable, true)[0];
                                    elem.css(angular.extend(elemStyle,{
                                        'width': targetElWidth + 'px'
                                        ,'height': targetElHeight + 'px'
                                    }));
                                }
                            }
                            else if(scope.menutype == 'right'){
                                conf.position = {};// 弹出方向
                                referElem = elem.parent();// 参照元素为监听右键的父元素
                                referElem.on('contextmenu',function(e){
                                    popupService.closeAll(true);// 关闭一级菜单
                                    var elemPos = referElem[0].getBoundingClientRect(), x, y;
                                    x = e.clientX;
                                    y = e.clientY;
                                    if( x >= elemPos.left && x <= elemPos.right
                                        && y >= elemPos.top && y <= elemPos.bottom){
                                        e.preventDefault();// 禁用浏览器右键菜单
                                        // 相对于整个文档的位置
                                        conf.position.x = e.clientX;
                                        conf.position.y = e.clientY;

                                        (function(){// 此方法体针对 frame 及非 static 定位的 body 计算弹出菜单的位置
                                            var _topWindow = $window.top // 顶层 window
                                                ,_window = $window // 当前判断到的 window
                                                ,_top = 0, _left = 0
                                                ,_inFrame = false; // menu 是否从 frame 中弹出
                                            var _windowBCR;
                                            var _scrollY = 0, _scrollX = 0;
                                            while(_window != _topWindow){// 由 _window 向外查找 frame
                                                if(!_inFrame){ // element 在当前 frame 中
                                                    _scrollX -= (_window.pageXOffset || _window.document.documentElement.scrollLeft);// 考虑框架内滚动
                                                    _scrollY -= (_window.pageYOffset || _window.document.documentElement.scrollTop);
                                                    _inFrame = true;
                                                }
                                                if(_inFrame){ // element 已经确定在内层 frame 中
                                                    _windowBCR = _window.frameElement.getBoundingClientRect();
                                                    _top += _windowBCR.top;
                                                    _left += _windowBCR.left;
                                                }
                                                _window = _window.parent;
                                            }
                                            var _bodyBCR = _topWindow.document.body.getBoundingClientRect();
                                            if(_inFrame){// 在 frame 中
                                                // body 非 static，因弹出项加在 body，将根据 body 定位，产生偏移)
                                                if($position.getStyle(_topWindow.document.body,'position')!='static') {
                                                    _scrollX -= _bodyBCR.left;
                                                    _scrollY -= _bodyBCR.top;
                                                }else{
                                                    _scrollX += (_topWindow.pageXOffset || _topWindow.document.documentElement.scrollLeft);
                                                    _scrollY += (_topWindow.pageYOffset || _topWindow.document.documentElement.scrollTop);
                                                }
                                            }else if($position.getStyle(_topWindow.document.body,'position')!='static') {
                                                _scrollX -= (_topWindow.pageXOffset || _topWindow.document.documentElement.scrollLeft) + _bodyBCR.left;
                                                _scrollY -= (_topWindow.pageYOffset || _topWindow.document.documentElement.scrollTop) + _bodyBCR.top;
                                            }
                                            conf.position.x += _left + _scrollX;
                                            conf.position.y += _top + _scrollY;
                                        })();

                                        scope.$digest();
                                    }
                                });
                                scope.$watch( 'conf.position', function (val) {// 监听菜单位置
                                    if(val && val['x'] && !scope.isOpen){
                                        scope.isOpen = true;
                                        popupService.open(scope, false);
                                        elem.css('zIndex',$position.getZIndex());// 获取 z-index，使 menu 在最上层
                                    }
                                }, true);

                                rePosition = function(){
                                    var viewElPos// 触发元素相对文档可见区域位置（含尺寸）
                                        ,domElPos// 触发元素相对文档位置
                                        ,elemStyle = {}// 菜单样式
                                        ,viewW = $window.innerWidth - menuConf.scollbarSize
                                        ,viewH = $window.innerHeight - menuConf.scollbarSize;// 文档可见区域尺寸，为滚动条留白 menuConf.scollbarSize
                                    targetElWidth = menuConf.liWidth + menuConf.divBorderSize * 2;// 初始化为不分栏的宽度
                                    targetElHeight = (menuConf.emptyUlHeight + 2 * menuConf.divBorderSize) + data.length * menuConf.liHeight;// 初始化为数据不分栏总高度（若可搜索，包含 toolbar 高度）
                                    (conf.filterable) && (targetElHeight += menuConf.toolbarHeight);// 是否显示过滤
                                    viewElPos = referElem[0].getBoundingClientRect();
                                    domElPos = $position.offset(referElem);

                                    elemStyle.left = conf.position.x + domElPos.left - viewElPos.left + 'px';
                                    elemStyle.top = conf.position.y + domElPos.top - viewElPos.top + 'px';
                                    // 若允许自适应，则根据需要进行分栏并调整弹出位置
                                    if(conf.adaptable != false) {
                                        manageSubs(viewW, viewH);
                                        if(viewW - conf.position.x < targetElWidth)
                                            elemStyle.left = viewW - targetElWidth + domElPos.left - viewElPos.left + 'px';
                                        if(viewH - conf.position.y < targetElHeight)
                                            elemStyle.top = viewH - targetElHeight + domElPos.top - viewElPos.top + 'px';
                                    }

                                    elem.css({
                                        'top': elemStyle.top ? elemStyle.top : ''
                                        ,'bottom': elemStyle.bottom ? elemStyle.bottom : ''
                                        ,'left': elemStyle.left ? elemStyle.left : ''
                                        ,'right': elemStyle.right ? elemStyle.right : ''
                                        ,'width': targetElWidth + 'px'
                                        ,'height': targetElHeight + 'px'
                                    });
                                }
                            }

                            ctrl.onSelect = scope.onselect()||angular.noop;// 选中项后执行的方法
                            scope.ctrl = ctrl;
//                            $document.find( 'body' ).append(elem);// 加在文档末尾
                            angular.element($window.top.document.body).append(elem);// 将弹出的菜单附加到 <body> - 考虑 iframe 情况，弹出层附加在最外层 window 中

                            scope.$on('$destroy', function() {
                                elem.remove();// 移除菜单
                                elem = null;// 销毁
                            })
                        }

                        // 允许检索关键字，监听
                        if(conf.filterable){
                            scope.filterval = '';
                            $filter('showFilter')(scope.dataprovider, scope.filterval);
                            scope.$watch('filterval', function (newValue, oldValue) {
                                if(newValue === oldValue) return;
                                $filter('showFilter')(scope.dataprovider, newValue);
                            });
                        }
                        scope.$watch('isOpen', function(val){
                            if(val == true) rePosition();
                            else{// 关闭子项
                                angular.forEach(scope.dataprovider,function(currentdata){
                                    currentdata.childopen = false;
                                });
                            }
                        });
                        // 监听父作用域传来的 dataprovider
                        scope.$watch( 'dataprovider', function (val) {
                            data = val || [];
                            scope.datagroups = [data];
                            scope.groupsBackward = [];
                            scope.groupsForward = [];
                            scope.isOpen && rePosition();// 若已打开，需要重新定位
                        }, false);
                        // 执行菜单事件（阻止事件冒泡，只执行当前点击项）
                        scope.clickLi = function(event, item){
                            if(item.enabled != false){
                                if(item.event){// 执行语句
                                    eval(item.event);
                                    popupService.closeAll();
                                    scope.ctrl.onSelect(item);// 执行自定义操作
                                    return;
                                }else if(!item.children){
                                    scope.ctrl.select(item);
                                    popupService.closeAll();
                                    scope.ctrl.onSelect(item);// 执行自定义操作
                                    return;
                                }
                            }
                            event.stopPropagation();// 无操作执行，不触发 document 隐藏菜单事件
                        };
                        // 显示前一栏
                        scope.backwardClick = function(event){
                            if(scope.groupsBackward.length > 0){
                                scope.datagroups.unshift(scope.groupsBackward.pop());
                                scope.groupsForward.unshift(scope.datagroups.pop());
                            }
                            event.stopPropagation();
                        };
                        // 显示后一栏
                        scope.forwardClick = function(event){
                            if(scope.groupsForward.length > 0){
                                scope.datagroups.push(scope.groupsForward.shift());
                                scope.groupsBackward.push(scope.datagroups.shift());
                            }
                            event.stopPropagation();
                        };
                        var hoverItem;
                        //悬停菜单项，关闭其他已打开的菜单项
                        scope.mouseenter = function(item){
                            if(item.enabled == false) return;
                            hoverItem = item;
                            $timeout(function(){
                                if(hoverItem == item){
                                    if(!item.childopen){
                                        angular.forEach(scope.dataprovider, function(currentdata){
                                            currentdata.childopen = false;
                                        });
                                        item.childopen = !item.childopen;
                                    }
                                }
                            },500);// 延迟打开子菜单
                        };
                        scope.mouseleave = function(item){
                            if(hoverItem == item){
                                hoverItem = undefined;
//                                if(item.childopen){// 关闭当前项子菜单
//                                    item.childopen = false;
//                                }
                            }
                        };

                        // 分栏函数
                        function manageSubs(maxW, maxH){
                            var rows = data.length// 每一列的 li 数量
                                ,cols = 1// 列数
                                ,trueCols = Math.floor((maxW - menuConf.divBorderSize * 2 + 1) / (menuConf.liWidth + 1));// 最多显示几列
                            scope.datagroups.length = 0;
                            scope.groupsBackward.length = 0;
                            scope.groupsForward.length = 0;
                            trueCols <= 0 && (trueCols = 1);// 最少需显示一列
                            while(targetElHeight > maxH){
                                cols ++;
                                rows = Math.ceil(data.length / cols);
                                targetElHeight = (menuConf.emptyUlHeight + 2 * menuConf.divBorderSize) + rows * menuConf.liHeight;
                                if(!conf.filterable && cols <= trueCols) continue;// 不需过滤，且不需翻页
                                targetElHeight += menuConf.toolbarHeight;
                            }
                            // 分栏计算完成，开始处理 datagroups
                            targetElWidth = Math.min(cols, trueCols) * (menuConf.liWidth + 1) + menuConf.divBorderSize * 2 - 1;// 实际宽度
                            for(var i=0; i<cols; i++){
                                var begin = i * rows, end;
                                if(i == cols)
                                    end = data.length;
                                else
                                    end = begin + rows;
                                if(i < trueCols)
                                    scope.datagroups.push(data.slice(begin, end));
                                else
                                    scope.groupsForward.push(data.slice(begin, end));
                            }
                        }
                    }
                }
            }
        }
    }])
    .filter('showFilter', function(){// 过滤所有节点
        function search(subData, keyword){
            var resultNum = 0;// 显示的 item 总数
            if(keyword && keyword != ''){
                angular.forEach(subData, function(item){
                    if(item.enabled != false){// 不检查不可用的项
                        item.highlight = (item.label.indexOf(keyword) >= 0);
//                        if(item.children && search(item.children, keyword) > 0){// 查询 children
//                            item.highlight = true;
//                        }
                        item.highlight && (resultNum ++);
                    }
                });
            }else{// 未设置过滤条件
                angular.forEach(subData, function(item){
                    item.highlight = false;
                    resultNum ++;
                    item.children && search(item.children);
                })
            }
            return resultNum;
        }
        return function(data, keyword){
            search(data, keyword);
            return data;
        }
    });
