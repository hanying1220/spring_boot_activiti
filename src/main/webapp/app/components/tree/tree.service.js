(function() {
    'use strict';

    angular
        .module('erpApp')
        .factory('TreeService', TreeService);

    TreeService.$inject = ['$resource'];

    function TreeService ($resource) {
        var service = $resource('/tree/tree', {}, {
            'get': {
                method: 'GET',
                params: {id:null},
                isArray: true,
                interceptor: {
                    response: function(response) {
                        // expose response
                        return response;
                    }
                }
            }
        });

        return service;
    }
})();
