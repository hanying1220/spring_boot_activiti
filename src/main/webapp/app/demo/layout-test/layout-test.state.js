(function() {
    'use strict';

    angular
        .module('erpApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider
            .state('layout-test', {
                parent: 'demo',
                url: '/layout-test',
                data: {
                    authorities: [],
                    pageTitle: '测试布局'
                },
                views: {
                    'content@app': {
                        templateUrl: 'app/demo/layout-test/layout-test.html'
                    }
                }
            });
    }
})();
