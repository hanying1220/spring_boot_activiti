(function() {
    'use strict';
    angular
        .module('erpApp')
        .config(stateConfig);
    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('upload-file', {
            parent: 'demo',
            url: '/upload-file',
            data: {
                authorities: [],
                pageTitle: 'upload-file.title'
            },
            views: {
                'content@app': {
                    templateUrl: 'app/demo/upload-file/upload-file.html'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('upload-file');
                    return $translate.refresh();
                }]
            }
        });
    }
})();
