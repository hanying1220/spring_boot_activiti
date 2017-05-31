/**
 Created by QianQi on 2014/11/10.
 */
angular.module('ui.wyy.searchinput', [])
/**
 * @ngdoc directive
 * @name ui.wisoft.searchinput.directive:wiSearchinput
 * @restrict E
 *
 * @description
 * wiSearch 是搜索控件，主要进行了样式封装，搜索时返回搜索栏中输入的文本。
 *
 * @param {string=} wiTips 搜索栏中默认显示的文本。
 * @param {function=} onsearch 搜索时执行的自定义方法，参数为选中项。
 *
 */
    .directive('wiSearchinput', [function(){
        return{
            restrict: 'E',
            templateUrl: 'app/components/wyy/template/wi-searchinput.html',
            replace: true,
            transclude: true,
            scope: {
                onsearch: '&'
            },
            link: function(scope, elem, attrs){
                var onSelect = scope.onsearch()||angular.noop;// 选中项后执行的方法
                scope.value = '';
                scope.tips = attrs['wiTips'] || '';
                scope.search = function(){
                    onSelect(scope.value);
                };
                elem.on('keydown',function(event){
                    if(event.keyCode === 13){// 回车
                        scope.$apply(function(){
                            onSelect(scope.value);
                        })
                    }
                });

            }
        }
    }]);
