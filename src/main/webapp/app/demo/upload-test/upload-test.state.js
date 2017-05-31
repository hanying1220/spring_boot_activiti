(function() {
    'use strict';
    angular
        .module('erpApp')
        .config(stateConfig);
    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('upload-test', {
            parent: 'demo',
            url: '/upload-test',
            data: {
                authorities: [],
                pageTitle: 'upload-test.title'
            },
            views: {
                'content@app': {
                    templateUrl: 'app/demo/upload-test/upload-test.html'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('upload-test');
                    return $translate.refresh();
                }]
            }
        });
    }
})();
