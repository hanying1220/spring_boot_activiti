(function() {
    'use strict';

    angular
        .module('erpApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider
            .state('personal', {
                parent: 'admin',
                url: '/personal',
                data: {
                    authorities: [],
                    pageTitle: '个人中心'
                },
                views: {
                    'content@app': {
                        templateUrl: 'app/admin/personal/personal.html',
                        controller: 'PersonalController',
                        controllerAs: 'vm'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('personal');
                        return $translate.refresh();
                    }]
                }
            })
    }
})();
