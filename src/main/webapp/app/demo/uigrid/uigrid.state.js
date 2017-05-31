(function() {
    'use strict';
    angular
        .module('erpApp')
        .config(stateConfig);
    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('uigrid', {
            parent: 'demo',
            url: '/uigrid',
            data: {
                authorities: [],
                pageTitle: 'uigrid.title'
            },
            views: {
                'content@app': {
                    templateUrl: 'app/demo/uigrid/uigrid.html',
                   // controller: 'AuditsController',
                   // controllerAs: 'vm'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('uigrid');
                    return $translate.refresh();
                }]
            }
        });
    }
})();
