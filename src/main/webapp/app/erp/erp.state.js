(function() {
    'use strict';

    angular
        .module('erpApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('erp', {
            abstract: true,
            parent: 'app'
        });
    }
})();
