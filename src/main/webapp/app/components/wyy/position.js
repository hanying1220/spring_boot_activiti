angular.module('ui.wyy.position', [])
/**
 * @ngdoc service
 * @name ui.wisoft.position.factory:$position
 *
 * @description
 * $position 提供一套获取元素位置，计算元素位置的方法。
 *
 */
    .factory('$position', ['$document', '$window', function ($document, $window) {
        var scollBarSize = 17;
        var zIndex = 5000;// 系统 z-index 从 5000 开始，最大为 2147483647
        /**
         * 获取计算后 el 元素的 cssprop 样式
         * @param el - DOM 元素
         * @param cssprop - 要获取的样式名
         */
        function getStyle(el, cssprop) {
            if (el.currentStyle) { //IE
                return el.currentStyle[cssprop];
            } else if ($window.getComputedStyle) {
                return $window.getComputedStyle(el)[cssprop];
            }
            // finally try and get inline style
            return el.style[cssprop];
        }

        /**
         * 检查 element 的 position 是否为 static
         * @param element - DOM 元素
         */
        function isStaticPositioned(element) {
            return (getStyle(element, 'position') || 'static' ) === 'static';
        }

        /**
         * 返回 element 最近的，非 static 布局的父元素(dom)，定位的参照元素
         * @param element - DOM 元素
         */
        var parentOffsetEl = function (element) {// 获取用于定位的父元素（已进行过 css 定位的元素 / <body>）
            var docDomEl = $document[0];
            var offsetParent = element.offsetParent || docDomEl;
            while (offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent)) {
                offsetParent = offsetParent.offsetParent;
            }
            return offsetParent || docDomEl;
        };

        /**
         * 返回是否需要反向
         * @param nowS - 当前空间尺寸
         * @param otherS - 备选空间尺寸
         * @param targetS - 需要的空间尺寸
         */
        var shouldChange = function(nowS, otherS, targetS){
            return nowS < targetS && otherS >= targetS;//当前空间不足，反向空间足够，返回 true，即需要反向
        };

        return {
            /**
             * @ngdoc method
             * @name ui.wisoft.position.$position#getZIndex
             * @methodOf ui.wisoft.position.factory:$position
             * @description 获取最大 z-index，使指定元素在顶层展现，从 5000 开始。
             * @return {number} z-index 数值。
             */
            getZIndex: function (){
                return zIndex++;
            },

            /**
             * @ngdoc method
             * @name ui.wisoft.position.$position#position
             * @methodOf ui.wisoft.position.factory:$position
             * @description 获取 element 相对于父元素（定位元素）的偏移，参考 jQuery 中的 element.position()。
             * @param {element} element 要计算的元素 - jqLite 元素。
             * @return {object} position {width:xx, height:xx, top:xx, left:xx, bottom:xx, right:xx} - 属性值是单位为 px 的数字。
             */
            position: function (element) {
                var pel = parentOffsetEl(element[0]),// element 最近的定位参照元素 parent
                    elBCR = element[0].getBoundingClientRect(),
                    w = elBCR.width || element.prop('offsetWidth'),
                    h = elBCR.height || element.prop('offsetHeight'),
                    top, left;
                if(pel != $document[0]){// 非根节点
                    var pelBCR = angular.element(pel)[0].getBoundingClientRect();
                    top = elBCR.top - pelBCR.top + pel.scrollTop - pel.clientTop;// 考虑父元素滚动与边框，box-sizing: boxder-box 时，clientTop = 0
                    left = elBCR.left - pelBCR.left + pel.scrollLeft - pel.clientLeft;
                }else{
                    top = elBCR.top + ($window.pageYOffset || $document[0].documentElement.scrollTop);
                    left = elBCR.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft);
                }
                return{
                    width: w,
                    height: h,
                    top: top,
                    left: left,
                    bottom: top + h,
                    right: left + w
                }
            },

            /**
             * @ngdoc method
             * @name ui.wisoft.position.$position#offset
             * @methodOf ui.wisoft.position.factory:$position
             * @description 获取 element 相对于文档的偏移，参考 jQuery 中的 element.offset()。
             * @param {element} element 要计算的元素 - jqLite 元素。
             * @return {object} {width:.., height:.., top:.., left:.., bottom:.., right:..} - 属性值是单位为 px 的数字。
             */
            offset: function (element) {
                var boundingClientRect = element[0].getBoundingClientRect()// element 相对于文档可见区域的 BCR
                    ,w = boundingClientRect.width || element.prop('offsetWidth')
                    ,h = boundingClientRect.height || element.prop('offsetHeight')
                    ,top = boundingClientRect.top + ($window.pageYOffset || $document[0].documentElement.scrollTop)// 考虑 scroll
                    ,left = boundingClientRect.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft);// 考虑 scroll
                return {
                    width: w,
                    height: h,
                    top: top,
                    left: left,
                    bottom: top + h,
                    right: left + w
                };
            },

            /**
             * @ngdoc method
             * @name ui.wisoft.position.$position#offsetTop
             * @methodOf ui.wisoft.position.factory:$position
             * @description 获取 element 相对于顶层 window 的偏移。
             * @param {element} element 要计算的元素 - jqLite 元素。
             * @return {object} [viewElPos(相对顶层 window 的偏移), domElPos(相对顶层 window 的 body 的偏移)] <br />
             * viewElPos、domElPos：{width:.., height:.., top:.., left:.., bottom:.., right:..} - 属性值是单位为 px 的数字。
             */
            offsetTop: function (element) {
                var _topWindow = $window.top // 顶层 window
                    ,_window = $window // 当前判断到的 window
                    ,_top = 0, _left = 0
                    ,_inFrame = false // element 是否在 frame 中
                    ,_viewElPos = element[0].getBoundingClientRect()
                    ,viewElPos // 触发元素相对顶层窗口的位置（含尺寸）
                    ,domElPos;// 触发元素相对顶层窗口 body 的位置（含尺寸）

                var _document = element[0].ownerDocument // element 所在的文档，用于寻找弹出窗口/frame
                    ,_windowBCR;

                while(_window != _topWindow){// 由 _window 向外查找 frame
                    if(!_inFrame && _document == _window.document){ // element 在当前 frame 中
                        _inFrame = true;
                    }
                    if(_inFrame){ // element 已经确定在内层 frame 中
                        _windowBCR = _window.frameElement.getBoundingClientRect();
                        _top += _windowBCR.top;
                        _left += _windowBCR.left;
                    }
                    _window = _window.parent;
                }
                viewElPos = {
                    top: _viewElPos.top + _top
                    ,bottom: _viewElPos.bottom + _top
                    ,left: _viewElPos.left + _left
                    ,right: _viewElPos.right + _left
                    ,width: _viewElPos.width
                    ,height: _viewElPos.height
                };
                var _scrollY = 0
                    ,_scrollX = 0;
                // body 非 static，因弹出项加在 body，将根据 body 定位，产生偏移
                if(getStyle(_topWindow.document.body,'position')!='static'){
                    var _bodyBCR = _topWindow.document.body.getBoundingClientRect();
                    _scrollX -= _bodyBCR.left;
                    _scrollY -= _bodyBCR.top;
                }else{
                    _scrollX += (_topWindow.pageXOffset || _topWindow.document.documentElement.scrollLeft);
                    _scrollY += (_topWindow.pageYOffset || _topWindow.document.documentElement.scrollTop);
                }
                domElPos = {
                    top: viewElPos.top + _scrollY
                    ,bottom: viewElPos.bottom + _scrollY
                    ,left: viewElPos.left + _scrollX
                    ,right: viewElPos.right + _scrollX
                    ,width: viewElPos.width
                    ,height: viewElPos.height
                };
                return [viewElPos, domElPos];
            },

            /**
             * 获取计算后 el 元素的 cssprop 样式
             * @param el - DOM 元素
             * @param cssprop - 要获取的样式名
             */
            getStyle: getStyle,

            /**
             * @ngdoc method
             * @name ui.wisoft.position.$position#positionElements
             * @methodOf ui.wisoft.position.factory:$position
             * @description 根据 referEl 计算 targetEl 相对于父定位元素的位置。
             * @param {element} refEl 触发元素 - jqLite 元素。
             * @param {number} targetElWidth 要定位的元素的宽(单位：像素)。
             * @param {number} targetElHeight 要定位的元素的高(单位：像素)。
             * @param {string} positionStr 定位方向: p-p，可能的值：top,left,right,bottom,center，但一级弹出方向不支持 center。
             * @return {position} {top:.., left:..} - 属性值是单位为 px 的数字。
             */
            positionTooltip: function (refEl, targetElWidth, targetElHeight, positionStr) {
                var positionStrParts = angular.isString(positionStr) ? positionStr.split('-') : [];
                var pos0 = positionStrParts[0] || 'bottom';
                var pos1 = positionStrParts[1] || 'left';

                var refElPos,
                    targetElPos;
                refElPos = this.position(refEl);

                var shiftWidth = {
                    center: function () {
                        return refElPos.left + refElPos.width / 2 - targetElWidth / 2;
                    },
                    left: function () {
                        return refElPos.left;
                    },
                    right: function () {
                        return refElPos.left + refElPos.width - targetElWidth;
                    }
                };

                var shiftHeight = {
                    center: function () {
                        return refElPos.top + refElPos.height / 2 - targetElHeight / 2;
                    },
                    top: function () {
                        return refElPos.top;
                    },
                    bottom: function () {
                        return refElPos.top + refElPos.height - targetElHeight;
                    }
                };

                switch (pos0) {
                    case 'right':
                        targetElPos = {
                            top: shiftHeight[pos1]() + 'px',
                            left: refElPos.right + 'px'
                        };
                        break;
                    case 'left':
                        targetElPos = {
                            top: shiftHeight[pos1]() + 'px',
                            left: refElPos.left - targetElWidth + 'px'
                        };
                        break;
                    case 'bottom':
                        targetElPos = {
                            top: refElPos.bottom + 'px',
                            left: shiftWidth[pos1]() + 'px'
                        };
                        break;
                    default:
                        targetElPos = {
                            top: refElPos.top - targetElHeight + 'px',
                            left: shiftWidth[pos1]() + 'px'
                        };
                        break;
                }

                return targetElPos;
            },

            /**
             * @ngdoc method
             * @name ui.wisoft.position.$position#positionElements
             * @methodOf ui.wisoft.position.factory:$position
             * @description 根据 referEl 的位置，弹出项的尺寸，弹出方向，计算 弹出项的位置。
             * @param {element} referEl 参照元素，根据其位置确定弹出项位置 - jqLite 元素。
             * @param {number} targetElWidth 要定位的元素的宽(单位：像素)。
             * @param {number} targetElHeight 要定位的元素的高(单位：像素)。
             * @param {string} positionStr 定位方向: p-p，可能的值：top,left,right,bottom,center。
             * @param {boolean} adaptable 是否自适应，根据浏览器可视部分空间调整弹出方向。
             * @param {boolean} appendToBody 弹出项是否是 <body> 的直接子元素，若为 true,位置相对于文档，若为 false，位置相对于定位父元素。
             * @return {array} [<br />
             *   {top:'..px', bottom:'..px', left: '..px', right:'..px'}, - 属性值是单位为 px 的数字 <br />
             *   positionStr - 'top-left'/'top-right'/'bottom-left'/'bottom-right'/'top-left'/'top-right'/'bottom-left'/'bottom-right'<br />
             *   ] - 属性值是单位为 px 的数字。
             */
            adaptElements: function(referEl, targetElWidth, targetElHeight, positionStr, adaptable, appendToBody){
                var viewElPos// 触发元素相对文档可见区域位置（含尺寸）
                    ,pos0, pos1
                    ,elemStyle = {}// 弹出项样式{top, bottom, left, right}
                    ,viewW, viewH;// 文档可见区域尺寸，为滚动条留白
                var positionStrParts = angular.isString(positionStr) ? positionStr.split('-') : [];
                pos0 = positionStrParts[0] || 'bottom';
                pos1 = positionStrParts[1] || 'left';
                /** 确定弹出区域，触发元素位置等 **/
                // 相对于顶层窗口文档
                if(appendToBody){
                    var _topWindow = $window.top // 顶层 window
                        ,offsetTopArr = this.offsetTop(referEl);
                    viewW = _topWindow.innerWidth - scollBarSize;
                    viewH = _topWindow.innerHeight - scollBarSize;
                    viewElPos = offsetTopArr[0];
                    var domElPos = offsetTopArr[1];
                }
                // 相对于触发元素
                else{
                    viewW = $window.innerWidth - scollBarSize;
                    viewH = $window.innerHeight - scollBarSize;
                    viewElPos = referEl[0].getBoundingClientRect();
                }

                // 允许自适应：根据弹出项实际尺寸，及可见范围调整弹出方向和位置
                if(adaptable){
                    // 确定 pos0，若当前空间不足且备选空间足够，或都不足但备选空间较大，则反向
                    switch(pos0){
                        case 'left':
                            shouldChange(viewElPos.left, viewW - viewElPos.right, targetElWidth) && (pos0 = 'right');
                            break;
                        case 'right':
                            shouldChange(viewW - viewElPos.right, viewElPos.left, targetElWidth) && (pos0 = 'left');
                            break;
                        case 'top':
                            shouldChange(viewElPos.top, viewH - viewElPos.bottom, targetElHeight) && (pos0 = 'bottom');
                            break;
                        default :
                            pos0 = 'bottom';
                            shouldChange(viewH - viewElPos.bottom, viewElPos.top, targetElHeight) && (pos0 = 'top');
                    }
                    // 确定 pos1
                    switch(pos1){
                        case 'center': break;
                        case 'top' :
                            shouldChange(viewH - viewElPos.top, viewElPos.bottom, targetElHeight) && (pos1 = 'bottom');
                            break;
                        case 'bottom':
                            shouldChange(viewElPos.bottom, viewH - viewElPos.top, targetElHeight) && (pos1 = 'top');
                            break;
                        case 'right':
                            shouldChange(viewElPos.right, viewW - viewElPos.left, targetElWidth) && (pos1 = 'left');
                            break;
                        default :
                            pos1 = 'left';
                            shouldChange(viewW - viewElPos.left, viewElPos.right, targetElWidth) && (pos1 = 'right');
                    }
                }

                /** 精确弹出位置 **/
                // 相对于顶层窗口文档绝对定位
                if(appendToBody){
                    // 根据参照元素的文档位置，计算弹出项的文档位置
                    switch(pos0){
                        case 'left':
                            elemStyle.left = domElPos.left - targetElWidth + 'px';
                            break;
                        case 'right':
                            elemStyle.left = domElPos.right + 'px';
                            break;
                        case 'top':
                            elemStyle.top = domElPos.top - targetElHeight + 'px';
                            break;
                        default :
                            pos0 = 'bottom';
                            elemStyle.top = domElPos.bottom + 'px';
                    }
                    // 二级方向位置确定，单向空间不足时，向右/下贴边
                    switch(pos1){
                        case 'center':
                            if(['left', 'right'].indexOf(pos0) >= 0){
                                elemStyle.top = domElPos.top + Math.floor((viewElPos.height - targetElHeight)/2) + 'px';
                            }
                            else{
                                elemStyle.left = domElPos.left + Math.floor((viewElPos.width - targetElWidth)/2) + 'px';
                            }
                            break;
                        case 'top':
                            if(adaptable != false && viewH - viewElPos.top < targetElHeight)
                                elemStyle.top = domElPos.top - viewElPos.top + viewH - targetElHeight + 'px';// 贴边
                            else
                                elemStyle.top = domElPos.top + 'px';
                            break;
                        case 'bottom':
                            if(adaptable != false && viewElPos.bottom < targetElHeight)
                                elemStyle.top = domElPos.top - viewElPos.top + viewH - targetElHeight + 'px';// 贴边
                            else
                                elemStyle.top = domElPos.bottom - targetElHeight + 'px';
                            break;
                        case 'right':
                            if(adaptable != false && viewElPos.right < targetElWidth)
                                elemStyle.left = domElPos.left - viewElPos.left + viewW - targetElWidth + 'px';
                            else
                                elemStyle.left = domElPos.right - targetElWidth + 'px';
                            break;
                        default :
                            pos1 = 'left';
                            if(adaptable != false && viewW - viewElPos.left < targetElWidth)
                                elemStyle.left = domElPos.left - viewElPos.left + viewW - targetElWidth + 'px';
                            else
                                elemStyle.left = domElPos.left + 'px';
                    }
                }
                // 相对于触发元素绝对定位
                else{
                    // 一级位置已确定，通过返回方向由 class 名控制，不需计算
                    // 二级方向位置确定，单向空间不足时，向右/下贴边
                    switch(pos1){
                        case 'center':
                            if(['left', 'right'].indexOf(pos0) >= 0){
                                elemStyle.top = Math.floor((viewElPos.height - targetElHeight)/2) + 'px';
                            }
                            else{
                                elemStyle.left = Math.floor((viewElPos.width - targetElWidth)/2) + 'px';
                            }
                            break;
                        case 'top' :
                            if(adaptable != false && viewH - viewElPos.top < targetElHeight)
                                elemStyle.top = viewH - viewElPos.top - targetElHeight + 'px';
                            break;
                        case 'bottom':
                            if(adaptable != false && viewElPos.bottom < targetElHeight)
                                elemStyle.bottom = viewElPos.bottom - viewH + 'px';
                            break;
                        case 'right':
                            if(adaptable != false && viewElPos.right < targetElWidth)
                                elemStyle.right = viewElPos.right - viewW + 'px';
                            break;
                        default:
                            pos1 = 'left';
                            if(adaptable != false && viewW - viewElPos.left < targetElWidth)
                                elemStyle.left = viewW - viewElPos.left - targetElWidth + 'px';
                    }
                }

                return [{
                    'top': elemStyle.top ? elemStyle.top : ''
                    ,'bottom': elemStyle.bottom ? elemStyle.bottom : ''
                    ,'left': elemStyle.left ? elemStyle.left : ''
                    ,'right': elemStyle.right ? elemStyle.right : ''
                }, pos0 + '-' + pos1];
            }
        };
    }]);
