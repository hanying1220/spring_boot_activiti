(function() {
    'use strict';

    angular
        .module('erpApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('org', {
            parent: 'erm',
            url: '/org',
            data: {
                authorities: [],
                pageTitle: '组织管理',
            },
            views: {
                'content@app': {
                    templateUrl: 'app/erm/organization/organization.html',
                    controller:'OrganizationController'
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
