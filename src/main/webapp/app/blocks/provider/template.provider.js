(function() {
    'use strict';

    angular
        .module('erpApp')
        .factory('templateProvider', templateProvider);

    templateProvider.$inject = ['$templateCache'];

    function templateProvider($templateCache) {
        return {
            initialize: initialize
        };

        function initialize() {
            var uiGridPagerTlp =  '<div role=\"contentinfo\" class=\"ui-grid-pager-panel\" ui-grid-pager ng-show=\"grid.options.enablePaginationControls\"><div role=\"navigation\" class=\"ui-grid-pager-container\"><span>共{{ paginationApi.getTotalPages() }}页/当前在<b>{{grid.options.paginationCurrentPage}}</b>页&nbsp;&nbsp;共{{grid.options.totalItems}}条<span></div><div class=\"ui-grid-pager-count-container\"> <div class=\"ui-grid-pager-count\"> <nav ng-show=\"grid.options.totalItems > 0\"> <ul class="pagination"> <li ng-class=\"{disabled:grid.options.paginationCurrentPage == 1}\"><a ng-click=\"pagePreviousPageClick()\" >&laquo;</a></li><li ng-class=\"{active:num == grid.options.paginationCurrentPage}\" ng-repeat=\"num in (paginationApi.getTotalPages() | pager:grid.options.paginationCurrentPage) track by $index"\"><a ng-click=\"paginationApi.seek(num)\">{{num}}</a></li><li ng-class=\"{disabled:grid.options.paginationCurrentPage == paginationApi.getTotalPages()}\"><a ng-click=\"pageLastPageClick()\">&raquo;</a></li></ul> </nav> </div> </div> </div>';
            $templateCache.put('ui-grid/pagination',uiGridPagerTlp);
        }
    }
})();
