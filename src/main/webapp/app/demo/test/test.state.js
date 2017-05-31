(function() {
    'use strict';

    angular
        .module('erpApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('test', {
            parent: 'demo',
            url: '/test',
            data: {
                authorities: [],
                pageTitle: 'test.title'
            },
            views: {
                'content@app': {
                    templateUrl: 'app/demo/test/test.html'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('test');
                    return $translate.refresh();
                }]
            }
        });

    }

})();
