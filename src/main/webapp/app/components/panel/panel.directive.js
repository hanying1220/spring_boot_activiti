angular.module('erpApp')
    .directive('uiPanel', [function() {
        return {
            restrict: 'E',
            templateUrl: 'app/components/panel/template/ui-panel.html',
            transclude:true,
            scope:{
                uid:'=',
                heading: '@'
            },

            controller: function () {
                $(".panel-body").niceScroll({
                    cursorcolor:"#cecfd0",
                    background:"cecfd0",
                    sensitiverail:true, // 点击滚动条，滚动到指定位置
                    hidecursordelay:1000, //设置光标隐藏延迟时间
                    rtlmode:"auto",
                    //grabcursorenabled:true,  //拖拽
                    //touchbehavior:true,
                    cursorwidth:"8px",
                });
                this.setHeading = function (element) {
                    this.headingEl = element;
                };
            },

            link: function(scope, el, attr) {
                //外部接口
                if(attr.uid) {
                    if(angular.isObject(scope.uid)) {
                        scope.uid.toggle = function(){
                            alert("1234");
                        }
                    }
                }
            }
        };
    }])
    .directive('uiPanelHeading',function(){
        return{
            restrict: 'E',
            transclude: true,
            template: '',
            replace: true,
            require: '^uiPanel',

            link:function(scope,element,attrs,panelGroupCtrl,transclude){
                panelGroupCtrl.setHeading(transclude(scope, function () {

                }));
            }
        }
    })
    .directive('uiPanelTransclude',function(){
        return{
            require:'^uiPanel',
            link:function(scope, element, attrs, controller){
                scope.$watch(function(){
                    return controller[attrs.uiPanelTransclude];
                },function(heading){
                    if(heading){
                        element.html('');
                        element.append(heading);
                    }
                });
            }
        }
    });

