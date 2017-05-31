(function() {
    'use strict';

    angular
        .module('erpApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider
            .state('modal-test', {
                parent: 'demo',
                url: '/modal-test',
                data: {
                    authorities: [],
                    pageTitle: '弹出框'
                },
                views: {
                    'content@app': {
                        templateUrl: 'app/demo/modal-test/modal-test.html',
                        controller: 'ModalTestController',
                        controllerAs: 'vm'
                    }
                }
            });
    }
})();
