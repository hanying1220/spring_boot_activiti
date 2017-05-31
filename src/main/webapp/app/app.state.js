(function() {
    'use strict';

    angular
        .module('erpApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider
            .state('app', {
                abstract: true,
                views: {
                    'app@': {
                        url:'/',
                        templateUrl: 'app/layouts/app.html'
                    },
                    'navbar@app':{
                        templateUrl: 'app/layouts/navbar/navbar.html',
                        controller: 'NavbarController',
                        controllerAs: 'vm'
                    },
                    'aside@app':{
                        templateUrl: 'app/layouts/aside/aside.html'
                    }
                },
                resolve: {
                    authorize: ['Auth',
                        function (Auth) {
                            return Auth.authorize();
                        }
                    ],
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('global');
                        $translatePartialLoader.addPart('password');
                        $translatePartialLoader.addPart('settings');
                    }]
                }
            })
    }
})();
