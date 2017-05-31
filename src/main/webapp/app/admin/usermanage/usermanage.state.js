(function() {
    'use strict';

    angular
        .module('erpApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider
            .state('usermanage', {
            parent: 'admin',
            url: '/usermanage',
            data: {
                authorities: ['ROLE_SYS_ADMIN'],
                pageTitle: '用户管理'
            },
            views: {
                'content@app': {
                    templateUrl: 'app/admin/usermanage/usermanage.html',
                    controller: 'UsermanageController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('usermanage');
                    return $translate.refresh();
                }]
            }
        })
    }
})();
