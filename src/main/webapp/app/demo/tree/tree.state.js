(function() {
    'use strict';
    angular
        .module('erpApp')
        .config(stateConfig);
    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('tree', {
            parent: 'demo',
            url: '/tree',
            data: {
                authorities: []
            },
            views: {
                'content@app': {
                    templateUrl: 'app/demo/tree/tree.html',
                    controller: 'TreeDemoController'
                   // controllerAs: 'vm'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    return $translate.refresh();
                }]
            }
        });
    }
})();
