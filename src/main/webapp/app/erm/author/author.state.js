(function() {
    'use strict';

    angular
        .module('erpApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider
            .state('auth', {
            parent: 'erm',
            url: '/author',
            data: {
                authorities: [],
                pageTitle: '授权管理'
            },
            views: {
                'content@app': {
                    templateUrl: 'app/erm/author/author.html',
                    controller: 'AuthorController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('author');
                    return $translate.refresh();
                }]
            }
        })
    }
})();
