(function() {
    'use strict';

    angular
        .module('erpApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('form', {
            parent: 'admin',
            url: '/form',
            data: {
                authorities: [],
                pageTitle: 'form.title'
            },
            views: {
                'content@app': {
                    templateUrl: 'app/demo/form/form.html',
                    /*  controller: 'TestController',
                     controllerAs: 'vm'*/
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('form');
                    return $translate.refresh();
                }]
            }
        });

    }

})();
