'use strict';
angular.module('ui.wyy.combobox',['ui.wyy.popup'])

    .constant('comboboxConfig',{
        liHeight: 18, // 弹出框li高度
        emptyMenuHeight: 12 // 弹出框空内容时高度 2 *（border + padding）
    })

    // 前端匹配
    .filter('comboboxFilter', ['comboboxService', function (comboboxService) {
        return function (data, key, labelField, groupfield) {
            var result;

            if(!key || key.length===0) {
                result = data;
            } else {
                result = [];

                angular.forEach(data, function (item) {
                    if(0===item[labelField].toLowerCase().indexOf(key.toLowerCase())) {
                        result.push(item);
                    }
                })
            }

            groupfield && (result = comboboxService.initData(result, labelField, groupfield));

            return result;
        }
    }])

    .factory('comboboxService', function () {
        var comboboxService = {};

        // 分组数据转换（数据源，label 域，group 域）TODO 未考虑数据源顺序
        comboboxService.initData = function (data, labelfield, groupfield) {
            var result = [], group = {};
            angular.forEach(data, function (item) {
                if(item[groupfield] && !group[item[groupfield]]) {
                    var gp = {};
                    gp[labelfield] = item[groupfield];
                    gp['isGroup'] = true;
                    result.push(gp);
                    result.push(item);
                    group[item[groupfield]] = gp;
                } else {
                    result.push(item);
                }
            });
            return result;
        };
        return comboboxService;
    })

/**
 * @ngdoc directive
 * @name ui.wisoft.combobox.directive:wiCombobox
 * @restrict E
 *
 * @description
 * 下拉框
 *
 * @param {array=} dataprovider 数据源.
 * @param {object=} selecteditem 默认选中条目.
 * @param {pixels=} dropdownwidth 弹出框宽度(不含单位：px)。未定义时，若定义了纯数字的 width,默认为 width,否则默认由文本自动撑.
 * @param {string=} labelfield 显示字段，默认为"name".
 * @param {string=} groupfield 分组字段.
 * @param {string=} rowcount 显示行数，默认为"5".
 * @param {boolean=} editable 是否可输入，默认为"true".
 * @param {boolean=} multiselect 多选.
 * @param {boolean=} enable 是否可用.
 * @param {number|length=} width 组件宽度，默认为 150px。<br />
 *   number 将自动添加单位 px。<br />
 *   length 为 number 接长度单位（相对单位和绝对单位）。<br />
 *   相对单位：em, ex, ch, rem, vw, vh, vm, %<br />
 *   绝对单位：cm, mm, in, pt, pc, px
 * @param {function=} itemchange 选中条目改变事件.
 *
 */
    .directive('wiCombobox',['$filter','$timeout','comboboxService','comboboxConfig',
        function ($filter, $timeout, comboboxService, comboboxConfig) {
            return {
                restrict:'E',
                templateUrl: 'app/components/wyy/template/comboboxTemplate.html',
                replace:true,
                scope: {
                    //Properties
                    dataprovider:'='// 数据源
                    ,itemrenderer:'@'// 自定义渲染
                    ,labelfield:'@'// 显示字段，默认为"name"
                    ,valuefield:'@'// 值字段
                    ,groupfield:'@'// 分组字段
                    ,wimodel:'='// 值对象
                    ,labelfunction:'&'// 自定义显示文本
                    ,prompt:'@'// 提示文本，默认为"--请选择--"
                    ,rowcount:'@'// 显示行数，默认为"5"
                    ,rowheight:'@'// 行高
                    ,selecteditem:'='// 所选条目，默认为null
                    ,editable:'@'// 是否可输入，默认为"true"，TODO 输入时autoComplete，
                    ,multiselect:'@'// 多选
                    ,enable:'@'// 是否可用
                    //Events
                    ,itemchange:'&'// 所选条目改变
                },
                require: 'wiPopup',
                link: function (scope,element,attrs,popupCtrl) {
                    var parentScope = scope.$parent,
                        vm = scope.vm = {},
                        input = element.find('INPUT');// 文本框
                    /**
                     * 根据wimodel设置初始选中条目
                     * itemChange的时候同步更新wimodel
                     */
                    // 初始化
                    vm.labelfield = scope.labelfield || 'name';// 用于显示的字段名
                    vm.valuefield = scope.valuefield || 'value';// 值字段
                    vm.prompt = scope.prompt || '--请选择--';
                    vm.editable = scope.editable !== 'false';
                    vm.enable = scope.enable;
                    vm.selecteditem = scope.selecteditem || null;
                    // 分组数据处理
                    if(scope.groupfield) {
                        vm.dataprovider = comboboxService.initData(scope.dataprovider, vm.labelfield, scope.groupfield);
                    } else {
                        vm.dataprovider = scope.dataprovider;
                    }
                    vm.rowcount = Math.min(vm.dataprovider.length, scope.rowcount || 5);// 下拉菜单显示行数 TODO 数据量动态变化
                    scope.multiselect && input.attr("readOnly",'true');// 多选禁止输入
                    !vm.editable && input.attr("readOnly",'true');// 只读
                    vm.selectedindex = vm.selecteditem ? vm.dataprovider.indexOf(vm.selecteditem) : -1;// 默认选中条目 - 默认为 -1

                    // 从属性获取 dropdownwidth，弹出部分的宽度
                    var dropdownwidth = parentScope.$eval(attrs['dropdownwidth']);
                    (!angular.isNumber(dropdownwidth)) && (dropdownwidth = undefined);
                    // 从属性获取 width，并处理
                    (function(attr){
                        if(!attr) return;
                        var width;
                        if(/^(?:[1-9]\d*|0)(?:.\d+)?/.test(attr)){// 数字开始
                            width = attr;
                        }else{// 非数字开始，可能是 scope 对象
                            width = parentScope.$eval(attr);
                        }
                        if(Number(width)){
                            element.css('width', width + 'px');
                            (!dropdownwidth) && (dropdownwidth = width);// 若未定义 dropdownwidth，则为 width
                        }else{
                            element.css('width', width);
                        }
                    })(attrs['width']);

                    // 向 popup 服务中传递弹出项配置
                    popupCtrl.popupOptions.height = comboboxConfig.emptyMenuHeight + comboboxConfig.liHeight * vm.rowcount;
                    popupCtrl.popupOptions.width = dropdownwidth;
                    vm.selecteditem && (vm._text = vm.selecteditem[vm.labelfield]);// input 中显示选中项 label

                    if(scope.wimodel != undefined) {
                        angular.forEach(vm.dataprovider, function (item, index) {
                            if(item[vm.valuefield] == scope.wimodel) {
                                vm._text = item[vm.labelfield];
                                vm.selectedindex = index;
                            }
                        });
                    }

                    // 若定义了 enable，监听禁用状态
                    if(attrs.hasOwnProperty('enable')){
                        scope.$watch('enable', function (oldValue, newValue) {
                            if(oldValue !== newValue) {
                                vm.enable = (oldValue === 'false');
                            }
                        });
                    }

                    /* 事件监听 */
                    var _onFocus = false;// 标记是否聚焦
                    input[0].addEventListener('focus', focus);
                    function focus(event) {// 聚焦已关闭的 combobox，打开
                        if(!vm.isopen) {
                            scope.$apply(function () {
                                vm.isopen = true;// 在 popup 服务中，焦点转移至 element
                                _onFocus = true;
                            });
                        }
                        event.stopPropagation();
                    }
                    element[0].addEventListener('blur',function(){// 失焦时修改 _onFocus - 失焦时由 popup 服务关闭
                        _onFocus = false;
                    });
                    input[0].addEventListener('click', inputClick);
                    function inputClick(event) {
                        if(_onFocus && vm.isopen) {// 若 _onFocus=true 且已打开，修改 _onFocus，此时聚焦元素为 element
                            _onFocus = false;
                            event.stopPropagation();// 禁止冒泡，防止在 popup 中再次修改 vm.isopen
                        }
                    }

                    // 列表项点击事件 - data：被点击的列表项数据
                    vm.itemClickHandler = function (data,event) {
                        if(data['isGroup']) {
                            // 阻止事件传播，不关闭弹出框
                            event.stopPropagation();
                            return;
                        }
                        if(scope.multiselect) {// 多选
                            event.stopPropagation();
                            data['_checked'] = !data['_checked'];// 修改选中状态
                            var txt = [],selItems = [];// 所有选中项文本及选中项
                            angular.forEach(scope.dataprovider, function (item) {
                                if(item['_checked']) {
                                    txt.push(item[vm.labelfield]);
                                    selItems.push(item);
                                }
                            });

                            vm.selecteditem = selItems;
                            vm._text = txt.join('; ');
                            // TODO 多选时model如何传

                        } else {// 单选
                            if(data != vm.selecteditem) {
                                scope.itemchange() && scope.itemchange()(data);
                            }
                            vm.selecteditem = data;
                            vm.selectedindex = vm.dataprovider.indexOf(vm.selecteditem);
                            vm._text = data[vm.labelfield];
                            scope.wimodel = data[vm.valuefield];
                        }
                    };

                    // 根据输入的内容过滤下拉框数据
                    vm.inputChange = function () {
                        $timeout(function(){
                            vm.dataprovider = $filter('comboboxFilter')(scope.dataprovider,vm._text,vm.labelfield,scope.groupfield);
                            if(!vm.isopen){
                                vm.isopen = true;
                            }
                            vm.selectedindex = ((vm.dataprovider.length > 0 && vm._text.length > 0) ? 0 : -1);
                            // 选中第一个非group
                            while(vm.dataprovider[vm.selectedindex]
                                && vm.dataprovider[vm.selectedindex]['isGroup']
                                && vm.selectedindex < vm.dataprovider.length) {
                                vm.selectedindex ++;
                            }
                        },0)
                    };

                    // 上、下、回车
                    vm.keydownHandler = function (event) {
                        var keyCode = event.keyCode;

                        // 上
                        if(keyCode === 38) {
                            do {
                                (vm.selectedindex !== 0 && vm.selectedindex !== -1) ? vm.selectedindex-- : vm.selectedindex = vm.dataprovider.length - 1;
                            } while(vm.dataprovider[vm.selectedindex]['isGroup'] && vm.selectedindex>=0);
                        }
                        // 下
                        else if(keyCode === 40) {
                            do {
                                vm.selectedindex < (vm.dataprovider.length - 1) ? vm.selectedindex++ : vm.selectedindex = 0;
                            } while(vm.dataprovider[vm.selectedindex]['isGroup'] && vm.selectedindex < vm.dataprovider.length);
                        }
                        // 回车
                        else if(keyCode === 13) {
                            if(vm.isopen) {
                                vm.dataprovider = $filter('comboboxFilter')(scope.dataprovider,'',vm.labelfield,scope.groupfield);
                                vm.selectedindex = vm.dataprovider.indexOf(vm.selecteditem);
                            } else {
								var selitem = vm.dataprovider[vm.selectedindex];
								if(vm.selecteditem != selitem) {
									scope.itemchange() && scope.itemchange()(selitem);
								}
                                vm.selecteditem = selitem;
                                vm.selecteditem && (vm._text = vm.selecteditem[vm.labelfield]) && (scope.wimodel = vm.selecteditem[vm.valuefield]);
                            }
                        }
                        else return;

                        $timeout(function () {
                            popupCtrl.popupOptions.elem[0].scrollTop = comboboxConfig.liHeight * vm.selectedindex;// 滚动到选中项
                        })
                    };

                    // TODO 是否需要，若需要未考虑 input.focus
                    vm.clickHandler = function () {
                        popupCtrl.popupOptions.elem[0].scrollTop = comboboxConfig.liHeight * vm.selectedindex;
                        if(vm.isopen) {
                            vm.dataprovider = $filter('comboboxFilter')(scope.dataprovider,'',vm.labelfield,scope.groupfield);
                        }
                    }

                }
            };
        }]);
