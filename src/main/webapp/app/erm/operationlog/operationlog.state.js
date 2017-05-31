(function() {
    'use strict';

    angular
        .module('erpApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider
            .state('operationlog', {
            parent: 'erm',
            url: '/operationlog',
            data: {
                authorities: [],
                pageTitle: '操作日志'
            },
            views: {
                'content@app': {
                    templateUrl: 'app/erm/operationlog/operationlog.html',
                    //controller: 'MenuController',
                    //controllerAs: 'vm'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('operationlog');
                    return $translate.refresh();
                }]
            }
        })
    }
})();
