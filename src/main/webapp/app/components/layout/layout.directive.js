angular.module('erpApp')
    .directive('jhiLayout', ['$http',function($http) {
        return {
            restrict: 'ACE',
            templateUrl: 'app/components/layout/template/layout.html',
            transclude:true,
            replace:true,
            link: function(scope, el, attr) {
                var col=attr.col || 6;
                var option={
                    col:'col-sm-'+col
                };
                //scope.option=option;
                el.addClass(option.col +' layout-box');
                //加载内容
                /*if(attr.template){
                    $http.get(attr.template)
                        .success(function (response) {
                            //console.log(response);
                            el.find('#content').html(response);
                        });
                }*/
            }
        };
    }]);
