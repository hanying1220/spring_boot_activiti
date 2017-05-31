(function() {
    'use strict';

    angular
        .module('erpApp')
        .filter('pager', pager);

    function pager() {
        return pagerFilter;

        /**
         *
         * @param input   总页数
         * @param curPage  当前页
         * @returns {Array}
         */
        function pagerFilter(input,curPage) {
            if (isNaN(curPage)) {
                curPage =  1;
            }
            var output = new Array();
            if (curPage) {

                if (curPage > 2){
                    for (var i = (curPage - 3); i < ((curPage + 2) > input ? input : (curPage + 2)); i++) {
                        output.push(i+1);
                    }
                }else{
                    for(var j = 0; j < input;j++){
                        output.push(j+1);
                    }
                }
            }
            return output;
        }
    }
})();
