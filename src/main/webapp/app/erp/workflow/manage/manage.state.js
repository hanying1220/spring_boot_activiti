(function() {
    'use strict';

    angular
        .module('erpApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider
            .state('workflow', {
            parent: 'erp',
            url: '/workflow',
            data: {
                authorities: ['ROLE_SYS_ADMIN','ROLE_TENANT_ADMIN'],
                pageTitle: '流程定义及部署管理'
            },
            views: {
                'content@app': {
                    templateUrl: 'app/erp/workflow/manage/manage.html',
                    controller: 'WorkflowController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('workflow');
                    return $translate.refresh();
                }]
            }
        })
    }
})();
