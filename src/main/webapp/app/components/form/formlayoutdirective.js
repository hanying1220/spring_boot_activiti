
    /*
     * @Author: yangyulong
     * @Email : yangyulong@hxsd.local
     * @Date:   2016-01-18 16:51:28
     * @Last Modified by:   yangyulong
     * @Last Modified time: 2016-01-26 22:23:06
     */
    angular.module('form.layout', [])
    /**
     * 定义布局的服务
     * @method
     * @param  {Object} )   this.defaultTemplate [���ֵ�ģ��]
     * @return {[type]}     [description]
     */
        .provider('formLayouttemple', function () {
            // 定义布局的服务
            function FormLayoutFn() {
                /**
                 * 定义表单元素的模板
                 * @type {{text: string, radio: string, checkbox: string, remember: string, range: string, time: string, date: string, datetime: string, search: string, select: string}}
                 */
                this.elementTemplate = {
                    text: '\<div class="form-group col-sm-6">\
                            <label class="col-sm-3"></label>\
                            <input type="text" class=" "col-sm-3 form-control" />\
                        </div>',
                    password: '<div class="form-group col-sm-6">\
                              <label class="col-sm-3"></label>\
                              <input type="password" class="form-control" />\
                          </div>',
                    radio: '\<div class="form-group">\
                                <label class="col-sm-3"></label>\
                                <div id="radiolist"></div>\
                            </div>',
                    email: '\<div class="form-group">\
                            <label class="col-sm-3"></label>\
                            <input type="email" class="form-control" />\
                        </div>',
                    tel: '\<div class="form-group">\
                            <label></label>\
                            <input type="tel" class="form-control" />\
                        </div>',
                    url: '\<div class="form-group">\
                            <label></label>\
                            <input type="url" class="form-control" />\
                        </div>',
                    number: '\<div class="form-group">\
                            <label></label>\
                            <input type="number" class="form-control" />\
                        </div>',
                    checkbox: '<div class="form-group">\
                                <label></label>\
                                <div id="checkboxlist"></div>\
                                </div>',
                    range: '<div class="form-group">\
                                <label></label>\
                                <input type="range"/>\
                          </div>',
                    time: '<div class="form-group">\
                                <label></label>\
                                <input type="time" class="form-control"/>\
                          </div>',
                    date: '<div class="form-group">\
                                <label></label>\
                                <input type="date" class="form-control"/>\
                          </div>',
                    datetime: '<div class="form-group">\
                                <label></label>\
                                <input type="datetime" class="form-control"/>\
                          </div>',
                    search: '<div class="form-group">\
                                <label></label>\
                                <input type="search" class="form-control"/>\
                          </div>',
                    select: '<div class="form-group col-sm-6">\
                                <label class="col-sm-3"></label>\
                                <select class="form-control col-sm-3"></select>\
                          </div>',
                    textarea: '<div class="form-group col-sm-3">\
                                <label class="col-sm-3"></label>\
                                <textarea class="form-control"></textarea>\
                            <div>',
                };
                //默认的模板, 可以使用如下的方式使用默认的模板
                this.defaultTemplate = '<input>';
                this.radioTmpl = '<label class="radio-inline"><input type="radio">radiotitle</label>';
                this.checkboxTmpl = '<label class="checkbox-inline"><input type="checkbox">checkboxtitle</label>';
            }

            FormLayoutFn.prototype = {
                /**
                 * 获取模板
                 * @method getElementTemplate
                 * @return {[type]}           [description]
                 */
                getElementTemplate: function () {
                    return this.elementTemplate;
                },

                /**
                 *  配置布局元素的模板
                 * @param configTemplate
                 */
                setElementTemplate: function (configTemplate) {
                    this.elementTemplate = angular.extend(this.elementTemplate, configTemplate);
                },

                /**
                 * 实现布局函数
                 * @method layout
                 * @param  {[type]} eleObj     ָ���е�ģ�����
                 * @param  {[type]} elementObj ������Ԫ�ض���
                 * @return {[type]}            [description]
                 */
                layout: function (eleObj, elementObj) {
                    var thiz = this;
                    var elementTemplate = this.elementTemplate;
                    var defaultTemplate = this.defaultTemplate;
                    var radioTmpl = this.radioTmpl;
                    var checkboxTmpl = this.checkboxTmpl;
                    if (angular.isObject(eleObj) && angular.isObject(elementObj)) {
                        angular.forEach(elementObj, function (elementObjIterm) {
                            var template = "<fieldset id='" + elementObjIterm.id + "'> <legend>" + elementObjIterm.legend.name + "</legend></fieldset>";
                            eleObj.append(template);
                            var templateObj11 = angular.element('#' + elementObjIterm.id);
                            //加入fieldset legend
                            angular.forEach(elementObjIterm.list, function (elementlist) {

                                console.log("elementObjIterm1" + elementlist);
                                console.log("type" + elementlist.attr.type);
                                var type = $.trim(elementlist.attr.type);
                                var templateObj = angular.element(elementTemplate[type]);
                                switch (type) {
                                    case 'textarea' :
                                        var fileld = templateObj.find('textarea');
                                        // var templateObj = angular.element(elementTemplate.textarea);
                                        break;
                                    case 'select' :
                                        var fileld = templateObj.find('select');
                                        // var templateObj = angular.element(elementTemplate.select);
                                        break;
                                    case 'button' :
                                        var fileld = templateObj.find('button');
                                        // var templateObj = angular.element(elementTemplate.button);
                                        break;
                                    case 'datepicker' :
                                        var fileld = templateObj.find('datepicker');
                                        // var templateObj = angular.element(elementTemplate.datepicker);
                                        break;
                                    case 'radio' :
                                        var fileld = templateObj.find('#radiolist');
                                        // var templateObj = angular.element(elementTemplate.datepicker);
                                        break;
                                    case 'checkbox' :
                                        var fileld = templateObj.find('#checkboxlist');
                                        // var templateObj = angular.element(elementTemplate.datepicker);
                                        break;
                                    default :
                                        var fileld = templateObj.find('input');
                                        break;
                                }
                                // 设置 label 的标签名字
                                templateObj.find('label').html(elementlist.labeltext);
                                templateObj.find('label').css("col-sm-3 control-label");
                                if ('select' == type) {
                                    var options = elementlist.attr.option;
                                    angular.forEach(options, function (opt) {
                                        var option = angular.element('<option value="' + opt.val + '">' + opt.content + '</option>');
                                        fileld.append(option);
                                    });
                                } else if ('radio' == type) {
                                    var options = elementObjIterm.attr.option;
                                    angular.forEach(options, function (content, val) {
                                        var tmpl = radioTmpl.replace('radiotitle', content);
                                        var tmplObj = angular.element(tmpl);
                                        tmplObj.find('input').attr('value', val);
                                        fileld.append(tmplObj);
                                    });
                                    // console.log(templateObj.find('label'));
                                } else if ('checkbox' == type) {
                                    var options = elementlist.attr.option;
                                    angular.forEach(options, function (content, val) {
                                        var tmpl = checkboxTmpl.replace('checkboxtitle', content);
                                        var tmplObj = angular.element(tmpl);
                                        tmplObj.find('input').attr('value', val);
                                        fileld.append(tmplObj);
                                    });
                                } else {
                                    angular.forEach(elementlist.attr, function (val, attrname) {
                                        fileld.attr(attrname, val);
                                    })
                                }
                                templateObj11.append(templateObj.append(fileld))

                            });
                        });

                        return eleObj;
                    } else {
                        throw '传入的参数不是对象';
                    }

                }

            };
            // 实例布局化构造类
            var formLayout = new FormLayoutFn();

            this.$get = function () {
                return formLayout;
            };
            //配置布局元素的模板
            this.setElementTemplate = function (configTemplate) {
                if (!configTemplate) return;
                formLayout.setElementTemplate(configTemplate);
            }
        });
    /**
     *  指令的实现
     * @method
     * @return {[type]}             [description]
     */
    angular.module('form.layout')
        .directive('formLayouttemple', ['$http', '$filter', 'formLayouttemple', function ($http, $filter, formLayouttemple) {
            return {
                restrict: 'AE',
                scope: {
                    url: "="
                    // fields : {}
                },
                replace: true,
                // templateUrl   : './tmpl/formlayout.html',
                transclude: true,
                // require : '?^formLayout',
                link: function (scope, elem, attrs) {
                    console.log(scope);
                    if (!scope.url) {
                        throw '请在指令参数url中传入获取数据的 url 的值';
                    }
                    $http.get("app/demo/test/formlayout.json").success(function (successData, status, headers, config) {
                        if (successData.data) {
                            //  scope.fields = successData;
                            processFormFilds(successData.data);
                        } else {
                            throw '获取表单数据失败';
                        }
                    })

                    function processFormFilds(data) {
                        formLayouttemple.layout(elem, data);
                        // console.log(data);
                    }
                }
            }
        }]);

