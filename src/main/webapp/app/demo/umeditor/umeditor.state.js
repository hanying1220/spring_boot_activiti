(function() {
    'use strict';
    angular
        .module('erpApp')
        .config(stateConfig);
    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('umeditor', {
            parent: 'demo',
            url: '/umeditor',
            data: {
                authorities: [],
                pageTitle: 'umeditor.title'
            },
            views: {
                'content@app': {
                    templateUrl: 'app/demo/umeditor/umeditor.html',
                    controller: 'umetitorController'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('umeditor');
                    return $translate.refresh();
                }]
            }
        });
    }
})();
