'use strict';
angular.module('ui.wyy.resizelistener', [])

    /**
     * @ngdoc service
     * @name ui.wisoft.resizelistener.wiResizeListener
     *
     * @description
     * 监听窗口大小改变，供组件内部调用
     *
     */
    .factory('wiResizeListener',[function(){

        var returnService = {};

        var attachEvent = document.attachEvent;

        if (!attachEvent) {
            var requestFrame = (function(){
                var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
                    function(fn){ return window.setTimeout(fn, 20); };
                return function(fn){ return raf(fn); };
            })();

            var cancelFrame = (function(){
                var cancel = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame ||
                    window.clearTimeout;
                return function(id){ return cancel(id); };
            })();

            var resetTriggers = function (element){
                var triggers = element.__resizeTriggers__,
                    expand = triggers.firstElementChild,
                    contract = triggers.lastElementChild,// 容器缩小时引起 scroll
                    expandChild = expand.firstElementChild;
                contract.scrollLeft = contract.scrollWidth;
                contract.scrollTop = contract.scrollHeight;
                expandChild.style.width = expand.offsetWidth + 1 + 'px';
                expandChild.style.height = expand.offsetHeight + 1 + 'px';
                expand.scrollLeft = expand.scrollWidth;
                expand.scrollTop = expand.scrollHeight;
            };

            var checkTriggers = function (element){
                return element.offsetWidth != element.__resizeLast__.width ||
                    element.offsetHeight != element.__resizeLast__.height;
            };

            var scrollListener = function (e){
                var element = this;
                resetTriggers(this);
                if (this.__resizeRAF__) cancelFrame(this.__resizeRAF__);
                this.__resizeRAF__ = requestFrame(function(){
                    if (checkTriggers(element)) {
                        element.__resizeLast__.width = element.offsetWidth;
                        element.__resizeLast__.height = element.offsetHeight;
                        element.__resizeListeners__.forEach(function(fn){
                            fn.call(element, e);
                        });
                    }
                });
            };
        }

        /**
         * 对指定元素添加resize监听
         * 若其父元素可能被隐藏，请使用 ng-show="val" 指令标识，当其显示时使此值为 true，隐藏时为 false，
         * 否则可能在切换父元素显示状态时无法对适应其尺寸的子元素生效。
         * @param element 要监听的容器
         * @param fn 含 $apply 的函数引用
         */
        returnService.addResizeListener = function(element, fn){
            if(!element.beListened){
                element.beListened=true;
                if (attachEvent){
                    element.attachEvent('onresize', fn);// IE11 以下
                }
                else if(getComputedStyle(element)) {
                    if (!element.__resizeTriggers__) {
                        if (getComputedStyle(element).position == 'static') element.style.position = 'relative';
                        element.__resizeLast__ = {};
                        element.__resizeListeners__ = [];
                        (element.__resizeTriggers__ = document.createElement('div')).className = 'resize-triggers';
                        element.__resizeTriggers__.innerHTML = '<div class="expand-trigger"><div></div></div>' +
                            '<div class="contract-trigger"></div>';
                        element.appendChild(element.__resizeTriggers__);
                        resetTriggers(element);
                        element.addEventListener('scroll', scrollListener, true);
                        element.__resizeListeners__.push(fn);
                    }
                }
            }else{
                if (attachEvent){
                    fn();
                }
                else if(getComputedStyle(element)) {
                    resetTriggers(element);
                }
            }
        };

        /**
         * 对指定元素移除resize监听
         * @param element
         * @param fn
         */
        returnService.removeResizeListener = function(element, fn){
            if (attachEvent) element.detachEvent('onresize', fn);
            else {
                element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1);
                if (!element.__resizeListeners__.length) {
                    element.removeEventListener('scroll', scrollListener);
                    element.__resizeTriggers__ = !element.removeChild(element.__resizeTriggers__);
                }
            }
        };
        return returnService;
    }]);
