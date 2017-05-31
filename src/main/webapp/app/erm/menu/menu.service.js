angular
    .module('erpApp')
    .factory('MenuService', MenuService);

MenuService.$inject = ['$resource'];

function MenuService ($resource) {
    var service = $resource('api/erm/menu/:id', {id:'@id'}, {
        'query': {method: 'GET', isArray: true},
        'get': {
            method: 'GET',
            transformResponse: function (data) {
                data = angular.fromJson(data);
                return data;
            }
        },
        'save': { method:'POST' },
        'update': { method:'POST' },
        'delete':{ method:'DELETE'}
    });

    return service;
}















