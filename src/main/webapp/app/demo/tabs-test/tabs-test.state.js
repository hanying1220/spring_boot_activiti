(function() {
    'use strict';

    angular
        .module('erpApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider
            .state('tabs-test', {
                parent: 'demo',
                url: '/tabs-test',
                data: {
                    authorities: [],
                    pageTitle: '测试Tabs'
                },
                views: {
                    'content@app': {
                        templateUrl: 'app/demo/tabs-test/tabs-test.html'
                    }
                }
            });
    }
})();
