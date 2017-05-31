(function() {
    'use strict';

    angular
        .module('erpApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider
            .state('role', {
            parent: 'erm',
            url: '/role',
            data: {
                authorities: [],
                pageTitle: '角色管理'
            },
            views: {
                'content@app': {
                    templateUrl: 'app/erm/role/role.html',
                    controller: 'RoleController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('role');
                    return $translate.refresh();
                }]
            }
        })
    }
})();
