angular
    .module('erpApp')
    .factory('RoleService', RoleService);

RoleService.$inject = ['$resource'];

function RoleService ($resource) {
    var service = $resource('api/users/:id', {id:'@id'}, {
        'query': {method: 'GET', isArray: true},
        'get': {
            method: 'GET',
            transformResponse: function (data) {
                data = angular.fromJson(data);
                return data;
            }
        },
        'select': { method:'GET' },
        'save': { method:'POST' },
        'update': { method:'PUT'},
        'delete':{ method:'DELETE'}
    });
    return service;
}















