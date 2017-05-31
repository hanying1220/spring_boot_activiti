angular.module('multi-select-tree').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('src/multi-select-tree.tpl.html',
    "<div class=\"tree-control\">\n" +
    "\n" +
    "    <div class=\"tree-input\" ng-click=\"onControlClicked($event)\">\n" +
    "    <span ng-if=\"selectedItems.length == 0\" class=\"selected-items\">\n" +
    "      <span ng-bind=\"defaultLabel\"></span>\n" +
    "    </span>\n" +
    "    <span ng-if=\"selectedItems.length > 0\" class=\"selected-items\">\n" +
    "      <span ng-repeat=\"selectedItem in selectedItems\" class=\"selected-item\">{{selectedItem.name}} <span class=\"selected-item-close\"\n" +
    "                                                                                  ng-click=\"deselectItem(selectedItem, $event)\"></span></span>\n" +
    "        <span class=\"caret\"></span>\n" +
    "    </span>\n" +
    "        <!-- <input type=\"text\" class=\"blend-in\" /> -->\n" +
    "    </div>\n" +
    "    <div class=\"tree-view\" ng-show=\"showTree\">\n" +
    "        <div class=\"helper-container\">\n" +
    "             <div class=\"line\" data-ng-if=\"switchView\">\n" +
    "                 <button type=\"button\" ng-click=\"switchCurrentView($event);\" class=\"helper-button\">{{switchViewLabel}}</button>\n" +
    "             </div>\n" +
    "            <div class=\"line\">\n" +
    "                <input placeholder=\"Search...\" type=\"text\" ng-model=\"filterKeyword\" ng-click=\"onFilterClicked($event)\"\n" +
    "                       class=\"input-filter\">\n" +
    "                <span class=\"clear-button\" ng-click=\"clearFilter($event)\"><span class=\"item-close\"></span></span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <ul class=\"tree-container\">\n" +
    "            <tree-item class=\"top-level\" ng-repeat=\"item in inputModel\" item=\"item\" ng-show=\"!item.isFiltered\"\n" +
    "                       use-callback=\"useCallback\" can-select-item=\"canSelectItem\"\n" +
    "                       multi-select=\"multiSelect\" item-selected=\"itemSelected(item)\"\n" +
    "                       on-active-item=\"onActiveItem(item)\" select-only-leafs=\"selectOnlyLeafs\"></tree-item>\n" +
    "        </ul>\n" +
    "    </div>\n" +
    "</div>\n"
  );


  $templateCache.put('src/tree-item.tpl.html',
    "<li>\n" +
    "    <div class=\"item-container\" ng-class=\"{active: item.isActive, selected: item.selected}\"\n" +
    "         ng-click=\"clickSelectItem(item, $event)\" ng-mouseover=\"onMouseOver(item, $event)\">\n" +
    "        <span ng-if=\"showExpand(item)\" class=\"expand\" ng-class=\"{'expand-opened': item.isExpanded}\"\n" +
    "              ng-click=\"onExpandClicked(item, $event)\"></span>\n" +
    "\n" +
    "        <div class=\"item-details\"><input class=\"tree-checkbox\" type=\"checkbox\" ng-if=\"showCheckbox()\"\n" +
    "                                         ng-checked=\"item.selected\"/>{{item.name}}\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <ul ng-repeat=\"child in item.children\" ng-if=\"item.isExpanded\">\n" +
    "        <tree-item item=\"child\" item-selected=\"subItemSelected(item)\" use-callback=\"useCallback\"\n" +
    "                   can-select-item=\"canSelectItem\" multi-select=\"multiSelect\"\n" +
    "                   on-active-item=\"activeSubItem(item, $event)\"></tree-item>\n" +
    "    </ul>\n" +
    "</li>\n"
  );

}]);
