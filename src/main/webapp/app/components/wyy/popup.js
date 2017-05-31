angular.module('ui.wyy.popup', ['ui.wyy.position'])
    .constant('popupConfig', {
        openClass: 'wi-popup-open'
    })
    .service('popupService', ['$document','$window', function ($document,$window) {
        var openScope // 记录当前打开的 scope
            ,_document = angular.element($window.top.document);
        // 打开，若未打开其它 scope，则绑定触发关闭的事件，否则直接关闭其他 scope
        this.open = function(scope, digest){
            if (!openScope) {// 没有其它已打开的 scope
//                $document.bind('click', closeMenu);
//                $document.bind('keydown', escapeKeyBind);
                _document.bind('click', closeMenu);
                _document.bind('keydown', escapeKeyBind);
            }
            if (openScope && openScope !== scope) {
                openScope.isOpen = false;
                digest && openScope.$digest();
            }
            openScope = scope;
        };
        // 关闭，解绑触发关闭的事件
        this.close = function(scope){
            if (openScope === scope) {
                openScope = null;
//                $document.unbind('click', closeMenu);
//                $document.unbind('keydown', escapeKeyBind);
                _document.unbind('click', closeMenu);
                _document.unbind('keydown', escapeKeyBind);
            }
        };
        this.closeAll = function(digest){
            closeMenu(digest);
        };
        // 关闭事件 - 仅当 digest 为 false 时脏检查（menu 中执行菜单项操作时关闭菜单）
        var closeMenu = function (digest) {
            if(openScope){
                digest ?
                    openScope.$apply(function(){
                        openScope.isOpen = false;
                    }) :
                    openScope.isOpen = false;
                openScope = null;
            }
        };
        var escapeKeyBind = function (evt) {
            if (evt.which === 27) {
                openScope.focusToggleElement && openScope.focusToggleElement();// 若定义了聚焦方法，关闭后聚焦当前项
                closeMenu();
            }
        };
    }])

    .controller('PopupController', ['$scope', '$attrs', '$parse', '$timeout','$position', 'popupService', 'popupConfig', function ($scope, $attrs, $parse, $timeout,$position, popupService, popupConfig) {
        var self = this,
            scope = $scope.$new(),// 创建子 scope，避免污染原始 scope
            openClass = popupConfig.openClass,
            getIsOpen,
            setIsOpen = angular.noop,
            toggleInvoker = $attrs['onToggle'] ? $parse($attrs['onToggle']) : angular.noop;
        self.popupOptions = {};

        this.init = function (element) {
            self.$element = element;

            if ($attrs.isOpen) {// 定义了 is-open 绑定的对象，添加监听
                getIsOpen = $parse($attrs.isOpen);
                setIsOpen = getIsOpen.assign;
                $scope.$watch(getIsOpen, function (value) {
                    scope.isOpen = !!value;
                });
            }
        };

        // 切换并返回 scope.isOpen，若传入 open 则切换为 open 指定的状态，否则根据当前状态切换
        this.toggle = function (open) {
            return scope.isOpen = arguments.length ? !!open : !scope.isOpen;
        };

        // 允许其他指令监听 isOpen
        this.isOpen = function () {
            return scope.isOpen;
        };

        scope.getToggleElement = function () {
            return self.$element;
        };

        scope.focusToggleElement = function () {
            self.$element[0].focus();
        };

        scope.$watch('isOpen', function (isOpen, wasOpen) {
            if(!self.popupOptions || !self.popupOptions.elem) return;// 无弹出项
            var pElem = self.$element,
                options = self.popupOptions,// 指令中定义的弹出项配置（elem: jqlite 元素 - 必须, height: 需用 style 定义的高度数值 - 可选, width: 同 height）
                popupElem = options.elem;
            if (isOpen) {
                scope.focusToggleElement();
                pElem.addClass(openClass);
                popupService.open(scope);
                popupElem.addClass('wi-popup-menu-open');
                popupElem.css({'top': 0, 'left': 0});// 避免导致 body 长度变化，引起滚动条变化

                $timeout(function(){// 延迟计算，1.3.6 版本中，此时无法获得弹出项尺寸
                    var targetPos = popupElem[0].getBoundingClientRect()// 弹出项 BCR
                        ,width = options.width || targetPos.width
                        ,height = options.height || targetPos.height
                        ,popupStyle = {
                            'visibility':'visible'// 避免改变位置时造成闪烁，此时才设置可见
                            ,'zIndex': $position.getZIndex()
                            ,'width': width + 'px'// 避免打开状态时内容变化造成 popup-menu 尺寸变化与 element 分离
                            ,'height': height + 'px'
                        };
                    popupStyle = angular.extend(
                        popupStyle,
                        $position.adaptElements(pElem, width, height, 'bottom-left', true, true)[0]// 计算得出的位置 style
                    );
                    popupElem.css(popupStyle);
                });
            } else {
                pElem.removeClass(openClass);
                popupElem.removeClass('wi-popup-menu-open').css({// 重置样式
                    'visibility': ''
                    ,'zIndex': ''
                    ,'width': ''
                    ,'height': ''
                });
                popupService.close(scope);
            }
            setIsOpen($scope, isOpen);
            if (angular.isDefined(isOpen) && isOpen !== wasOpen) {
                toggleInvoker($scope, { open: !!isOpen });// 切换完成执行自定义操作
            }
        });

        $scope.$on('$locationChangeSuccess', function () {
            scope.isOpen = false;
        });

        $scope.$on('$destroy', function () {
            scope.$destroy();
        });
    }])

    /**
     * @ngdoc directive
     * @name ui.wisoft.popup.directive:wiPopup
     * @restrict E
     *
     * @description
     * popup 弹出层
     *
     * @param {string=} isOpen 弹出层的弹出状态，双向绑定，需绑定 scope 中的对象
     *
     */
    .directive('wiPopup', ['$window',function ($window) {
        return {
            restrict: 'CA',
            controller: 'PopupController',
            link: function (scope, element, attrs, popupCtrl) {
                // 提取弹出项，附加到 body 中
                var popupElem;
                angular.forEach(element.children(), function(child){
                    if(popupElem === undefined && (' ' + child.className +  ' ').indexOf('wi-popup-menu') >= 0){
                        popupElem = angular.element(child);// 用 class = wi-popup-menu 标记元素为弹出项
                        $window.top.document.body.appendChild(child);// 将弹出的菜单附加到 <body> - 考虑 iframe 情况，弹出层附加在最外层 window 中
                        popupCtrl.popupOptions.elem = popupElem;
                    }
                });

                // 切换弹出层打开状态
                var togglePopup = function (event) {
                    if (event.type === 'keydown' && event.keyCode !== 13) {// 回车键
                        return;
                    }
                    event.preventDefault();// 禁止浏览器默认事件
                    event.stopPropagation();// qq:防止重复触发关闭事件
                    if (!element.hasClass('disabled') && !attrs.disabled) {// 未禁用
                        scope.$apply(function () {
                            popupCtrl.toggle();// 执行切换
                        });
                    }
                };
                element.bind('click', togglePopup);
                element.bind('keydown', togglePopup);
                scope.$on('$destroy', function () {
                    if(popupElem !== undefined){
                        popupElem.remove();// 移除
                        popupElem = null;// 销毁
                    }
                    element.unbind('click', togglePopup);
                    element.unbind('keydown', togglePopup);
                });

                // WAI-ARIA
                element.attr({ 'aria-haspopup': true, 'aria-expanded': false });
                scope.$watch(popupCtrl.isOpen, function (isOpen) {
                    element.attr('aria-expanded', !!isOpen);
                });

                popupCtrl.init(element);
            }
        };
    }]);
