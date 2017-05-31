(function() {
    'use strict';

    angular
        .module('erpApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider
            .state('accesslog', {
            parent: 'erm',
            url: '/accesslog',
            data: {
                authorities: ['ROLE_TENANT_ADMIN','ROLE_TENANT_USER'],
                pageTitle: '访问日志'
            },
            views: {
                'content@app': {
                    templateUrl: 'app/erm/accesslog/accesslog.html',
                    controller: 'AccesslogController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('accesslog');
                    return $translate.refresh();
                }]
            }
        })
    }
})();
