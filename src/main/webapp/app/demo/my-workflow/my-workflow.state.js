(function() {
    'use strict';

    angular
        .module('erpApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider
            .state('my-workflow', {
                parent: 'demo',
                url: '/my-workflow',
                data: {
                    authorities: [],
                    pageTitle: '代办任务'
                },
                views: {
                    'content@app': {
                        templateUrl: 'app/demo/my-workflow/my-workflow.html',
                        controller: 'MyWorkflowController'
                    }
                }
            });
    }
})();
