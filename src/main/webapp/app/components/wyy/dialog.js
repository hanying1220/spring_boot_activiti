'use strict';
angular.module('ui.wyy.dialog', ['ui.wyy.position'])

/**
 * @ngdoc service
 * @name ui.wisoft.dialog.wiDialog
 *
 * @description
 * wiDialog 用来弹出模态的窗口service，常见的简单提示框、confirm对话框以及更复杂的弹出框都可以使用wiDialog。
 */
	.provider('wiDialog', function () {

		var $el = angular.element;
		var isDef = angular.isDefined;
		var style = (document.body || document.documentElement).style;
		var animationEndSupport = isDef(style.animation) || isDef(style.WebkitAnimation) || isDef(style.MozAnimation) || isDef(style.MsAnimation) || isDef(style.OAnimation);
		var animationEndEvent = 'animationend webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend';
		var forceBodyReload = false;

        //参数默认值
		var defaults = this.defaults = {
//			className: 'wi-dialog-theme-default',
			plain: false,//是否允许使用字符串作为template
			showClose: true,//关闭按钮
			closeByDocument: false,//点击页面关闭dialog
			closeByEscape: true,//点击键盘ESC关闭dialog
            overlay:true//模态弹出框
		};

		this.setForceBodyReload = function (_useIt) {
			forceBodyReload = _useIt || false;
		};

		var globalID = 0, dialogsCount = 0, closeByDocumentHandler, defers = {};

		this.$get = ['$document', '$templateCache', '$compile', '$q', '$http', '$rootScope', '$timeout', '$window', '$controller','$position',
			function ($document, $templateCache, $compile, $q, $http, $rootScope, $timeout, $window, $controller, $position) {
				var $body = $document.find('body');
				if (forceBodyReload) {
					$rootScope.$on('$locationChangeSuccess', function () {
						$body = $document.find('body');
					});
				}

                var _document,_$window,_$body;

				var privateMethods = {
					onDocumentKeydown: function (event) {
						if (event.keyCode === 27) {
							publicMethods.closeOne('$escape');
						}
					},

					//设置padding(原始padding+传入的参数width)，并将原始的padding保存到$body中
					setBodyPadding: function (width) {
						var originalBodyPadding = parseInt(($body.css('padding-right') || 0), 10);
						$body.css('padding-right', (originalBodyPadding + width) + 'px');
						$body.data('ng-dialog-original-padding', originalBodyPadding);
					},

					//重置padding
					resetBodyPadding: function () {
						var originalBodyPadding = $body.data('ng-dialog-original-padding');
						if (originalBodyPadding) {
							$body.css('padding-right', originalBodyPadding + 'px');
						} else {
							$body.css('padding-right', '');
						}
					},

					closeDialog: function ($dialog, value) {
						var id = $dialog.attr('id');
						if (typeof window.Hammer !== 'undefined') {
							window.Hammer($dialog[0]).off('tap', closeByDocumentHandler);
						} else {
							$dialog.unbind('click');
						}

						//如果当前是关闭最后一个dialog,则unbind键盘事件keydown
						if (dialogsCount === 1) {
							$body.unbind('keydown');
						}

						if (!$dialog.hasClass("wi-dialog-closing")) {
							dialogsCount -= 1;
						}

						if (animationEndSupport) {
							$dialog.unbind(animationEndEvent).bind(animationEndEvent, function () {
								$dialog.scope().$destroy();
								$dialog.remove();
                                $dialog.css({visiblity:'hidden'})
								if (dialogsCount === 0) {
									$body.removeClass('wi-dialog-open');
									privateMethods.resetBodyPadding();
								}
								$rootScope.$broadcast('wiDialog.closed', $dialog);
							}).addClass('wi-dialog-closing');
						} else {
							$dialog.scope().$destroy();
							$dialog.remove();
							if (dialogsCount === 0) {
								$body.removeClass('wi-dialog-open');
								privateMethods.resetBodyPadding();
							}
							$rootScope.$broadcast('wiDialog.closed', $dialog);
						}
						//dialog关闭后调用resolve，设置defers[id].promise的值
						if (defers[id]) {
							defers[id].resolve({
								id: id,
								value: value,
								$dialog: $dialog,
								remainingDialogs: dialogsCount
							});
							delete defers[id];
						}
					}
				};

				var publicMethods = {

                    /**
                     * @ngdoc method
                     * @name ui.wisoft.dialog.wiDialog#open
                     * @methodOf ui.wisoft.dialog.wiDialog
                     * @description 打开dialog的最基本的方法。
                     *
                     * @param {Object} options
                     * {<br>
                     *  template : String类型，值可以为ng-template的ID, html片段的URL  或者 直接使用字符串(需要将plain设为true)<br>
                     *  plain  : Boolean类型，开启字符串作为模板，默认false<br>
                     *  scope  : Object类型。如果传递了scope,该scope将作为弹出框的父scope。<br>
                     *  controller  : String类型，指定弹出框使用的controller名称<br>
                     *  showClose  : Boolean类型，显示关闭按钮，默认 true<br>
                     *  closeByEscape  : Boolean类型，通过ESC关闭dialog,默认 true<br>
                     *  closeByDocument  : Boolean类型，通过点击页面关闭dialog,默认 true<br>
                     *  overlay: Boolean类型，指定是否模态弹出，默认为true<true>
                     *  dialogInIframe  : 是否在iframe中居中显示，默认情况下所有的弹出框都是在最外层的页面中弹出（开发时一般不采用单一APP，所以应用功能实际上会被放在iframe中）<br>
                     *  }
                     *
                     * @return {Object}
                     * {
                     *   id: 弹出框的id.<br>
                     *   closePromise: 关闭窗口的promise，通过该promise可以监听弹出框关闭。<br>
                     *   close: 关闭当前弹出框
                     * }
                     *
                     */
					open: function (opts) {
						var self = this;
						var options = angular.copy(defaults);

						opts = opts || {};
						angular.extend(options, opts);

						globalID += 1;

                        self.latestID = 'widialog' + globalID;

                        var defer;
                        defers[self.latestID] = defer = $q.defer();//以最新打开的dialog的id为key创建一个新的deffer

                        //如果参数中没有指定scope,则创建$rootScope的一个子域作为dialog实例的作用域
                        var scope = angular.isObject(options.scope) ? options.scope.$new() : $rootScope.$new();
                        var $dialog, $dialogParent, $dialogOverlay;

						$q.when(loadTemplate(options.template)).then(function (template) {
							template = angular.isString(template) ?
								template :
									template.data && angular.isString(template.data) ?
								template.data :
								'';

							//将载入的模板文件放入$templateCache中保存，下次使用时可以直接从$templateCache中取
							$templateCache.put(options.template, template);
							// z-index 由 $position 统一管理
							self.$result = $dialog = $el('<div id="widialog' + globalID + '" class="wi-dialog" style="z-index:'+ $position.getZIndex() +'" ></div>');

                            var htmlstr = [
                                    '<div dialog-draggable="wi-dialog-head" id="wiDialogMain' + globalID + '" class="wi-dialog-main">',
                                    '<div class="wi-dialog-head">' + (options.title || "") + '<span class="wi-dialog-close icon-remove"></span></div>',
                                    '<div class="wi-dialog-content">' + template + '</div></div>'
                            ];
                            //设置不显示header
                            if(options.withoutHead){
                                htmlstr=[
                                        '<div id="wiDialogMain' + globalID + '" class="wi-dialog-main">',
                                        '<div class="wi-dialog-content">' + template + '<span class="wi-dialog-close icon-remove"></span></div></div>'
                                ];
                            }
                            $dialog.html(htmlstr.join(''));

                            //如果设置了模态
                            if(options.overlay===true){
                                $dialog.prepend('<div class="wi-dialog-overlay"></div>');
                            }


						    //实例化controller
							if (options.controller &&
                                (angular.isString(options.controller) ||
                                    angular.isFunction(options.controller))) {
                                //为dialog 实例化controller
                                var controllerInstance = $controller(options.controller, {
                                    $scope: scope,
                                    $element: $dialog
                                });
                                //将controllerInstance实例保存到$dialog中,有何用处？？？？？？
                                $dialog.data('$ngDialogControllerController', controllerInstance);
							}

//							if (options.className) {
//								$dialog.addClass(options.className);
//							}

							//dialog页面中可以直接通过wiDialogData访问open方法传递过来的data值
							if (options.data && angular.isString(options.data)) {
								var firstLetter = options.data.replace(/^\s*/, '')[0];
								scope.wiDialogData = (firstLetter === '{' || firstLetter === '[') ? angular.fromJson(options.data) : options.data;
							} else if (options.data && angular.isObject(options.data)) {
								scope.wiDialogData = angular.fromJson(angular.toJson(options.data));
							}

                            //iframe处理，默认所有的dialog全部在顶层窗口弹出
                            if(!options.dialogInIframe){
                                $dialogParent=angular.element(window.top.document.body);
                                _document=window.top.document;
                                _$window=$window.top;
                                _$body=angular.element(_document.body);
                            }else{
                                $dialogParent = angular.element(document.body);
                                _document=document;
                                _$window=$window;
                                _$body=$body;
                            }

                            //指定dialog添加到dom中的位置，可以指定元素的ID或者类名
                            //如果指定了dialogInIframe为false，会从iframe的父窗体进行查找
                            if (options.appendTo && angular.isString(options.appendTo)) {
                                $dialogParent = angular.element(_document.querySelector(options.appendTo));
                            }

							scope.closeThisDialog = function (value) {
								privateMethods.closeDialog($dialog, value);
							};

							$timeout(function () {
								$compile($dialog)(scope);

								var widthDiffs = _$window.innerWidth - $body.prop('clientWidth');
//								_$body.addClass('wi-dialog-open');//是否要隐藏滚动条？
								var scrollBarWidth = widthDiffs - (_$window.innerWidth - $body.prop('clientWidth'));
								if (scrollBarWidth > 0) {
									privateMethods.setBodyPadding(scrollBarWidth);
								}
								$dialogParent.append($dialog);

                                //处理dialog水平垂直居中
								//根据当前dialogmain的ID，将dialog设置为垂直水平居中(因为dialog不设初始高度，所以采用这种方法)
								var $dialogMain = angular.element(_document.querySelector('#wiDialogMain' + globalID));

                                var $dialogbody = angular.element(_document.querySelector('#widialog' + globalID));
								var cssValues = {
									'margin-left': -$dialogMain.prop('clientWidth') / 2 + 'px',
									'margin-top': -$dialogMain.prop('clientHeight') / 2 + 'px'
                                    ,'visibility':'hidden'//先隐藏，设置css的时候再显示，规避闪屏的问题
								};
//                                //dialog框宽度设定
								if (angular.isNumber(options.width)) {
									cssValues.width = options.width + 'px';
									cssValues['margin-left'] = -options.width / 2 + 'px';
									// 此处可能也同时引起了高度变化，margin-top也要跟着改
									// img 尺寸为定义的时候，会在加载图片时才获得尺寸，导致高度再次发生变化，可以在 css 中对对话框中的定义统一尺寸
								}
                                if (angular.isNumber(options.height)) {
                                    cssValues.height = options.height + 'px';//如果指定了height则将height设置为指定值
                                    cssValues['margin-top'] = -options.height / 2 + 'px';
                                }
								$dialogMain.css(cssValues);

                                //垂直居中修正
                                $timeout(function(){
                                    $dialogMain.css({'margin-top': -$dialogMain.prop('clientHeight') / 2 + 'px', 'visibility':'visible'});
                                    var diff = $dialogMain.prop('offsetTop');
                                    if(diff < 0){
                                        $dialogMain.css({'margin-top':'0','top':'0','height': $dialogMain.prop('clientHeight') + diff*2 +'px'});
                                    }
                                });
								$rootScope.$broadcast('wiDialog.opened', $dialog);
							});

							if (options.closeByEscape) {
								_$body.bind('keydown', privateMethods.onDocumentKeydown);
							}

							closeByDocumentHandler = function (event) {
								var isOverlay = options.closeByDocument ? $el(event.target).hasClass('wi-dialog-overlay') : false;
								var isCloseBtn = $el(event.target).hasClass('wi-dialog-close');
								if (isOverlay || isCloseBtn) {
									publicMethods.closeOne($dialog.attr('id'), isCloseBtn ? '$closeButton' : '$document');
								}
							};

							if (typeof window.Hammer !== 'undefined') {
								window.Hammer($dialog[0]).on('tap', closeByDocumentHandler);
							} else {
                                $dialog.bind('click', closeByDocumentHandler);
							}

							dialogsCount += 1;

							return publicMethods;
						});

						return {
							id: 'widialog' + globalID,
							closePromise: defer.promise,//只有关闭dialog的时候才会调用deffer.resolve方法，所以这里叫closePromise
							close: function (value) {
								privateMethods.closeDialog($dialog, value);
							}
						};

						//载入模板
						function loadTemplate(tmpl) {
							if (!tmpl) {
								return 'Empty template';
							}
							if (angular.isString(tmpl) && options.plain) {
								return tmpl;
							}
							//直接从$templateCache中取，取不到则发起http请求
							return $templateCache.get(tmpl) || $http.get(tmpl, { cache: true });
						}
					},

                    /**
                     * @ngdoc method
                     * @name ui.wisoft.dialog.wiDialog#openConfirm
                     * @methodOf ui.wisoft.dialog.wiDialog
                     * @description
                     *
                     * @param {Object} options 见open方法的options。
                     *
                     * @return {Object} promise,返回一个promise,如果使用 .confirm() 方法来关闭dialog，则该promise被resolved，否则被 rejected.
                     *
                     */
					openConfirm: function (opts) {
						var defer = $q.defer();

						var options = {
							closeByEscape: false,//默认情况下ESC不能通过ESC关闭dialog
							closeByDocument: false//默认 不能通过鼠标点击文档关闭dialog
						};
						angular.extend(options, opts);

						options.scope = angular.isObject(options.scope) ? options.scope.$new() : $rootScope.$new();
						//
						options.scope.confirm = function (value) {
							defer.resolve(value);
							openResult.close(value);
						};

						var openResult = publicMethods.open(options);
						//如果调用了closeDialog方法，则reject。
						// 这种情况说明调用openConfirm打开了dialog窗口，但是又通过点击页面 或者 关闭按钮  或者 ESC 将dialog关闭。
						openResult.closePromise.then(function (data) {
							//data有值说明调用了closeDialog，对于openConfirm来说应该调用reject
							if (data) {
								return defer.reject(data.value);
							}
							return defer.reject();
						});

						return defer.promise;
					},

                    /**
                     * @ngdoc method
                     * @name ui.wisoft.dialog.wiDialog#closeOne
                     * @methodOf ui.wisoft.dialog.wiDialog
                     * @description 关闭一个dialog。
                     *
                     * @param {String=} id 要关闭的dialog的ID，如果没有指定ID，则关闭所有的dialog。
                     * @param {Object=} value 关闭窗口时要返回的值，dialog可以通过promise可以获取该值。
                     *
                     */
					closeOne: function (id, value) {
						var $dialog = $el(_document.getElementById(id));

						//如果没有传递dialog的id，则关闭当前所有的dialog
						if ($dialog.length) {
							privateMethods.closeDialog($dialog, value);
						} else {
							publicMethods.closeAll(value);
						}
						return publicMethods;
					},
                    /**
                     * @ngdoc method
                     * @name ui.wisoft.dialog.wiDialog#closeAll
                     * @methodOf ui.wisoft.dialog.wiDialog
                     * @description 用来关闭通过wiDialog弹出的所有的dialog.
                     *
                     * @param {Object=} value 关闭窗口时要返回的值，每个dialog的都可以通过promise可以获取该值。
                     *
                     *
                     */
					closeAll: function (value) {
						var $all = _document.querySelectorAll('.wi-dialog');

						angular.forEach($all, function (dialog) {
							privateMethods.closeDialog($el(dialog), value);
						});
					}
				};

				return publicMethods;
			}];
	})
    //用来支持拖动（暂时这样写，将来在看是否有必要替换成通用的指令） - 值为 element 下监听拖动的子元素的 class
    .directive('dialogDraggable',['$document', function($document) {
        return function(scope, element, attrs) {
            var dragClass = attrs['dialogDraggable']
                ,dragElem;// 监听拖动的 jqlite 元素
            if(dragClass){
                angular.forEach(element.children(), function(child){
                    if(dragElem === undefined && (' ' + child.className +  ' ').indexOf(dragClass) >= 0){
                        dragElem = angular.element(child);
                    }
                });
            }
            if(!dragElem) dragElem = element;// 为定义监听拖动的元素，监听 element

            var startX = 0, startY = 0, x= 0, y=0;
            //dialogIniframe设为true时，弹出不支持拖动（默认都是在顶层窗口弹出的）
            var _doc=window.top.document;
//            var doc=document;

            dragElem.on('mousedown', function(event) {
                // 元素初始位置
                if (window.getComputedStyle) { // IE9 以下不支持
                    x = window.getComputedStyle(element[0])['left'];
                    y = window.getComputedStyle(element[0])['top'];
                }
                x = Number(x.replace('px','')) || 0;
                y = Number(y.replace('px','')) || 0;
                // 阻止所选对象的默认拖曳操作
                event.preventDefault();
                startX = event.screenX;// 鼠标按下的初始位置
                startY = event.screenY;
                element.css({ 'cursor':'move'});
                // 添加鼠标移动及抬起监听
                _doc.addEventListener('mousemove', mousemove);
                _doc.addEventListener('mouseup', mouseup);
//            doc.addEventListener('mousemove', mousemove);
//            doc.addEventListener('mouseup', mouseup);
            });

            function mousemove(event) {
                element.css({
                    top: y + event.screenY -startY + 'px',
                    left: x + event.screenX -startX + 'px'
                });
            }

            function mouseup() {
                element.css({'cursor':'default'});
                _doc.removeEventListener('mousemove', mousemove);
                _doc.removeEventListener('mouseup', mouseup);
//            doc.removeEventListener('mousemove', mousemove);
//            doc.removeEventListener('mouseup', mouseup);
            }
    }
}]);
