(function () {
    angular
        .module('ng-layer', [])
        .factory('layer', layer);

    /**
     * ng-layer
     * @desc 扩展layer,让layer支持ng
     * @example
     * // 所有options均支持以下contentUrl & scope
     * layer.open({
     *      contentUrl: 'modules/home/index.html'
     *      scope: $scope // 如果使用的是 controller as 语法, 可以不传入这个参数
     * });
     *
     * @returns layer
     */
    layer.$inject = ['$rootScope','$compile','$timeout','$q','$http','$templateCache'];
    function layer ($rootScope, $compile, $timeout, $q, $http,$templateCache) {
        var layer  = window.layer;
        var _open  = layer.open;
        var _close = layer.close;
        var _full  = layer.full;
        // 装饰open
        layer.open = function (deliver) {
            var defer = $q.defer();

            // 判断异步载入
            if($templateCache.get(deliver.contentUrl)){
                defer.resolve(deliver.data = $templateCache.get(deliver.contentUrl));
            }else{
                if (deliver.contentUrl) {
                    $http({
                        url  : deliver.contentUrl,
                        cache: true
                    }).then(function (rst) {
                        defer.resolve(deliver.data = rst.data);
                    });
                } else {
                    defer.resolve(null);
                }
            }


            return defer.promise.then(function (content) {
                deliver.content = content || deliver.content || '';

                var oldOpen     = _open(deliver);
                var $el         = $('#layui-layer' + oldOpen);
                var $content    = $el.find('.layui-layer-content');
                var injectScope = deliver.scope || $rootScope.$new();

                $content.replaceWith($compile($content[0].outerHTML)(injectScope));

/*
                $timeout(function () {
                    $(window).resize();
                });
*/

                return oldOpen;
            });
        };

        // 装饰close
        layer.close = function (index) {
            $q.when(index).then(function (index) {
                _close(index);
            })
        };

        // 装饰full
        layer.full = function (index) {
            $q.when(index).then(function (index) {
                _full(index);
            })
        };

        return layer;
    }
})();
