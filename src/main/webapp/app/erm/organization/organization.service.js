var app=angular.module('erpApp');
app.factory('OrganizationService', OrganizationService);
OrganizationService.$inject = ['$resource'];
function OrganizationService ($resource) {
    var service = $resource('api/users/:id', {id:'@id'}, {
        'query': {method: 'GET', isArray: true},
        'get': {
            method: 'GET',
            transformResponse: function (data) {
                data = angular.fromJson(data);
                return data;
            }
        },
        'save': { method:'POST' },
        'update': { method:'PUT'},
        'delete':{ method:'DELETE'}
    });
    return service;
}















