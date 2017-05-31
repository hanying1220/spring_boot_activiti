(function() {
    'use strict';

    angular
        .module('erpApp', [
            'ngStorage',
            'tmh.dynamicLocale',
            'pascalprecht.translate',
            'ngResource',
            'ngCookies',
            'ngAria',
            'ngCacheBuster',
            'ngFileUpload',
            'ui.bootstrap',
            'ui.router',
            // jhipster-needle-angularjs-add-module JHipster will add new module here
            'angular-loading-bar',
            'ui.wyy.messagetip',
            'ui.wyy.position',
            'ui.wyy.alert',
            'ui.wyy.menu',
            'ui.wyy.tabset',
            'ui.wyy.tree',
            'ui.wyy.dropdown',
            'ui.wyy.searchinput',
            'ui.wyy.combobox',
            'ui.grid',
            'ui.grid.pagination',
            'ui.grid.edit',
            'ui.grid.treeView',
            'ui.grid.grouping',
            'addressFormatter',
            "ui.grid.draggable-rows",
            'ui.grid.exporter',
            'ui.grid.selection',
            'w5c.validator',
            'oi.select',
            'ngFileUpload',
            'multi-select-tree',
            'form.layout',
            'ng-layer'
        ])
        .run(run);

    run.$inject = ['stateHandler', 'translationHandler','templateProvider'];

    function run(stateHandler, translationHandler,templateProvider) {
        stateHandler.initialize();
        translationHandler.initialize();
        templateProvider.initialize();
    }
})();
