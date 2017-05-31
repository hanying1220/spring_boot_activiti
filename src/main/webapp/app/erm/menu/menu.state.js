(function() {
    'use strict';

    angular
        .module('erpApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider
            .state('menu', {
            parent: 'erm',
            url: '/menu',
            data: {
                authorities: [],
                pageTitle: "菜单管理"
            },
            views: {
                'content@app': {
                    templateUrl: 'app/erm/menu/menu.html',
                    controller: 'MenuController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('menu');
                    return $translate.refresh();
                }]
            }
        })
    }
})();
