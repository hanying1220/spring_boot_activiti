/**
 * Created by pc on 2016-12-19.
 */

(function() {
    'use strict';
    angular.module('erpApp')
        .directive('uiButton', [function () {
            return {
                restrict: 'E',
                templateUrl: 'app/components/button/template/ui-button.html',
                replace: true,
                transclude: true,
                scope: {},
                link: function (scope, elem, attrs) {
                    var parentScope = scope.$parent;

                    var getSizeFromAttr = function (attr) {
                        if (!attr) return;
                        var size;
                        if (/^(?:[1-9]\d*|0)(?:.\d+)?/.test(attr)) {// 数字开始
                            size = attr;
                        } else {// 非数字开始，可能是 scope 对象
                            size = parentScope.$eval(attr);
                        }
                        Number(size) && (size += 'px');// 是数字则加上单位 px
                        return size;
                    }

                    scope.btnOptions = {
                        label: attrs['label'] || '',
                        width: getSizeFromAttr(attrs['width']) || null,
                        height: getSizeFromAttr(attrs['height']) || null,
                        type: attrs['type'] || 'button',
                        class: attrs['class'] || 'btn btn-default',
                        icoclass:attrs['icoclass'] || ''
                    }

                    if (scope.btnOptions.width && scope.btnOptions.height) {
                        elem.css('overflow', 'hidden');
                    }
                    if (attrs.hasOwnProperty('disabled') && attrs['disabled'] != 'false') {// 是否禁用
                        elem[0].disabled = true;
                    }
                    elem[0].setAttribute('type', scope.btnOptions.type);
                }
            }
        }])
})();

