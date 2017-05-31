(function() {
    'use strict';

    angular.module('ui.grid.draggable-rows', ['ui.grid'])

    .constant('uiGridDraggableRowsConstants', {
        featureName: 'draggableRows',
        ROW_TARGET_CLASS: 'ui-grid-draggable-row-target',
        ROW_OVER_CLASS: 'ui-grid-draggable-row-over',
        ROW_OVER_ABOVE_CLASS: 'ui-grid-draggable-row-over--above',
        ROW_OVER_BELOW_CLASS: 'ui-grid-draggable-row-over--below',
        ROW_HANDLE_CLASS: 'ui-grid-draggable-row-handle',
        POSITION_ABOVE: 'above',
        POSITION_BELOW: 'below',
        publicEvents: {
            draggableRows: {
                rowDragged: function(scope, info, rowElement) {},
                rowDropped: function(scope, info, targetElement) {},
                rowOverRow: function(scope, info, rowElement) {},
                rowEnterRow: function(scope, info, rowElement) {},
                rowLeavesRow: function(scope, info, rowElement) {},
                rowFinishDrag: function(scope) {},
                beforeRowMove: function(scope, from, to, data) {}
            }
        }
    })

    .factory('uiGridDraggableRowsCommon', [function() {
        return {
            draggedRow: null,
            draggedRowEntity: null,
            targetRow: null,
            targetRowEntity: null,
            position: null,
            fromIndex: null,
            toIndex: null,
            dragDisabled: false
        };
    }])

    .factory('uiGridDraggableRowsSettings', [function() {
        return {
            dragDisabled: false
        };
    }])

    .service('uiGridDraggableRowsService', ['uiGridDraggableRowsConstants', 'uiGridDraggableRowsCommon' , 'uiGridDraggableRowsSettings', function(uiGridDraggableRowsConstants, uiGridDraggableRowsCommon, uiGridDraggableRowsSettings) {
        var publicMethods = {
            dragndrop: {
                setDragDisabled: function setDragDisabled(status) {
                    uiGridDraggableRowsSettings.dragDisabled = ~~status;
                }
            }
        };

        this.initializeGrid = function(grid, $scope, $element) {
            grid.api.registerEventsFromObject(uiGridDraggableRowsConstants.publicEvents);
            grid.api.registerMethodsFromObject(publicMethods);

            grid.api.draggableRows.on.rowFinishDrag($scope, function() {
                angular.forEach($element[0].querySelectorAll('.' + uiGridDraggableRowsConstants.ROW_OVER_CLASS), function(row) {
                    row.classList.remove(uiGridDraggableRowsConstants.ROW_OVER_CLASS);
                    row.classList.remove(uiGridDraggableRowsConstants.ROW_OVER_ABOVE_CLASS);
                    row.classList.remove(uiGridDraggableRowsConstants.ROW_OVER_BELOW_CLASS);
                });
                angular.forEach($element[0].querySelectorAll('.' + uiGridDraggableRowsConstants.ROW_TARGET_CLASS), function(row) {
                    row.classList.remove(uiGridDraggableRowsConstants.ROW_TARGET_CLASS);
                });
            });
        };
    }])

    .service('uiGridDraggableRowService', ['uiGridDraggableRowsConstants', 'uiGridDraggableRowsCommon', 'uiGridDraggableRowsSettings', '$parse', function(uiGridDraggableRowsConstants, uiGridDraggableRowsCommon, uiGridDraggableRowsSettings, $parse) {
        var move = function(from, to, grid) {
            grid.api.draggableRows.raise.beforeRowMove(from, to, this);

            /*jshint validthis: true */
            this.splice(to, 0, this.splice(from, 1)[0]);
        };

        this.prepareDraggableRow = function($scope, $element) {
            var grid = $scope.grid;
            var row = $element[0];
            var hasHandle = $scope.grid.options.useUiGridDraggableRowsHandle;
            var currentTarget = null;
            var handle = null;

            var data = function() {
                if (angular.isString(grid.options.data)) {
                    return $parse(grid.options.data)(grid.appScope);
                }

                return grid.options.data;
            };

            (function() {
                // issue #51
                var draggableState = null;

                // issue #16
                if (grid.api.hasOwnProperty('edit')) {
                    grid.api.edit.on.beginCellEdit(null, function() {
                        draggableState = row.getAttribute('draggable');
                        row.setAttribute('draggable', false);
                    });

                    grid.api.edit.on.afterCellEdit(null, function() {
                        row.setAttribute('draggable', draggableState);
                        draggableState = null;
                    });
                }
            }());

            var listeners = {
                onMouseDownEventListener: function (e) {
                    currentTarget = angular.element(e.target);
                    handle = currentTarget.closest('.' + uiGridDraggableRowsConstants.ROW_HANDLE_CLASS, $element)[0];
                },

                onMouseUpEventListener: function (e) {
                    currentTarget = null;
                    handle = null;
                },

                onDragOverEventListener: function(e) {
                    if (e.preventDefault) {
                        e.preventDefault();
                    }

                    var dataTransfer = e.dataTransfer || e.originalEvent.dataTransfer;
                    dataTransfer.effectAllowed = 'copyMove';
                    dataTransfer.dropEffect = 'move';

                    var offset = e.offsetY || e.layerY || (e.originalEvent ? e.originalEvent.offsetY : 0);

                    $element.addClass(uiGridDraggableRowsConstants.ROW_OVER_CLASS);

                    if (offset < this.offsetHeight / 2) {
                        uiGridDraggableRowsCommon.position = uiGridDraggableRowsConstants.POSITION_ABOVE;

                        $element.removeClass(uiGridDraggableRowsConstants.ROW_OVER_BELOW_CLASS);
                        $element.addClass(uiGridDraggableRowsConstants.ROW_OVER_ABOVE_CLASS);

                    } else {
                        uiGridDraggableRowsCommon.position = uiGridDraggableRowsConstants.POSITION_BELOW;

                        $element.removeClass(uiGridDraggableRowsConstants.ROW_OVER_ABOVE_CLASS);
                        $element.addClass(uiGridDraggableRowsConstants.ROW_OVER_BELOW_CLASS);
                    }

                    grid.api.draggableRows.raise.rowOverRow(uiGridDraggableRowsCommon, this);
                },

                onDragStartEventListener: function(e) {
                    if (uiGridDraggableRowsSettings.dragDisabled || (hasHandle && !handle)) {
                        e.preventDefault();
                        e.stopPropagation();

                        return false;
                    }

                    this.classList.add(uiGridDraggableRowsConstants.ROW_TARGET_CLASS);
                    e.dataTransfer.setData('Text', 'move'); // Need to set some data for FF to work
                    uiGridDraggableRowsCommon.draggedRow = this;
                    uiGridDraggableRowsCommon.draggedRowEntity = $scope.$parent.$parent.row.entity;

                    uiGridDraggableRowsCommon.position = null;

                    uiGridDraggableRowsCommon.fromIndex = data().indexOf(uiGridDraggableRowsCommon.draggedRowEntity);
                    uiGridDraggableRowsCommon.toIndex = null;

                    grid.api.draggableRows.raise.rowDragged(uiGridDraggableRowsCommon, this);
                },

                onDragLeaveEventListener: function() {
                    this.classList.remove(uiGridDraggableRowsConstants.ROW_TARGET_CLASS);

                    this.classList.remove(uiGridDraggableRowsConstants.ROW_OVER_CLASS);
                    this.classList.remove(uiGridDraggableRowsConstants.ROW_OVER_ABOVE_CLASS);
                    this.classList.remove(uiGridDraggableRowsConstants.ROW_OVER_BELOW_CLASS);

                    grid.api.draggableRows.raise.rowLeavesRow(uiGridDraggableRowsCommon, this);
                },

                onDragEnterEventListener: function() {
                    grid.api.draggableRows.raise.rowEnterRow(uiGridDraggableRowsCommon, this);
                },

                onDragEndEventListener: function() {
                    grid.api.draggableRows.raise.rowFinishDrag();
                },

                onDropEventListener: function(e) {
                    var draggedRow = uiGridDraggableRowsCommon.draggedRow;

                    if (e.stopPropagation) {
                        e.stopPropagation();
                    }

                    if (e.preventDefault) {
                        e.preventDefault();
                    }

                    if (draggedRow === this) {
                        return false;
                    }

                    uiGridDraggableRowsCommon.toIndex = data().indexOf($scope.$parent.$parent.row.entity);

                    uiGridDraggableRowsCommon.targetRow = this;

                    uiGridDraggableRowsCommon.targetRowEntity = $scope.$parent.$parent.row.entity;

                    if (uiGridDraggableRowsCommon.position === uiGridDraggableRowsConstants.POSITION_ABOVE) {
                        if (uiGridDraggableRowsCommon.fromIndex < uiGridDraggableRowsCommon.toIndex) {
                            uiGridDraggableRowsCommon.toIndex -= 1;
                        }

                    } else if (uiGridDraggableRowsCommon.fromIndex >= uiGridDraggableRowsCommon.toIndex) {
                        uiGridDraggableRowsCommon.toIndex += 1;
                    }

                    $scope.$apply(function() {
                        move.apply(data(), [uiGridDraggableRowsCommon.fromIndex, uiGridDraggableRowsCommon.toIndex, grid]);
                    });

                    grid.api.draggableRows.raise.rowDropped(uiGridDraggableRowsCommon, this);

                    e.preventDefault();
                }
            };

            row.addEventListener('dragover', listeners.onDragOverEventListener, false);
            row.addEventListener('dragstart', listeners.onDragStartEventListener, false);
            row.addEventListener('dragleave', listeners.onDragLeaveEventListener, false);
            row.addEventListener('dragenter', listeners.onDragEnterEventListener, false);
            row.addEventListener('dragend', listeners.onDragEndEventListener, false);
            row.addEventListener('drop', listeners.onDropEventListener);

            if (hasHandle) {
                row.addEventListener('mousedown', listeners.onMouseDownEventListener, false);
                row.addEventListener('mouseup', listeners.onMouseUpEventListener, false);
            }
        };
    }])

    .directive('uiGridDraggableRow', ['uiGridDraggableRowService', function(uiGridDraggableRowService) {
        return {
            restrict: 'ACE',
            scope: {
                grid: '='
            },
            compile: function() {
                return {
                    pre: function($scope, $element) {
                        uiGridDraggableRowService.prepareDraggableRow($scope, $element);
                    }
                };
            }
        };
    }])

    .directive('uiGridDraggableRows', ['uiGridDraggableRowsService', function(uiGridDraggableRowsService) {
        return {
            restrict: 'A',
            replace: true,
            priority: 0,
            require: 'uiGrid',
            scope: false,
            compile: function() {
                return {
                    pre: function($scope, $element, $attrs, uiGridCtrl) {
                        uiGridDraggableRowsService.initializeGrid(uiGridCtrl.grid, $scope, $element);
                    }
                };
            }
        };
    }]);
}());
