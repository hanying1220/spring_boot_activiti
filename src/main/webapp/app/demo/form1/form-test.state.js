(function() {
    'use strict';

    angular
        .module('erpApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider
            .state('form-test', {
                parent: 'demo',
                url: '/form-test',
                data: {
                    authorities: [],
                    pageTitle: 'form-test'
                },
                views: {
                    'content@app': {
                        templateUrl: 'app/demo/form1/form-demo.html',
                        controller:  'FormDemoCtrl'
                    }
                },

            });
    }
})();
