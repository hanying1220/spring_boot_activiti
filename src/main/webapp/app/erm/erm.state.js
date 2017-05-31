(function() {
    'use strict';

    angular
        .module('erpApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('erm', {
            abstract: true,
            parent: 'app'
        });
    }
})();
