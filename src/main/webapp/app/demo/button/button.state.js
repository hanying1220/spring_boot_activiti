(function() {
    'use strict';
    angular
        .module('erpApp')
        .config(stateConfig);
    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('button', {
            parent: 'demo',
            url: '/button',
            data: {
                authorities: [],
                pageTitle: 'button.title'
            },
            views: {
                'content@app': {
                    templateUrl: 'app/demo/button/button.html',
                    controller: 'ButtonController'
                   // controllerAs: 'vm'
                }
            },
            resolve: {
                /*translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('button');
                    return $translate.refresh();
                }]*/
            }
        });
    }
})();
