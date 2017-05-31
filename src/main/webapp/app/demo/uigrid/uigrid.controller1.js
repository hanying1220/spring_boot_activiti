angular
    .module('erpApp')
    .controller('UiGridController', UiGridTreeController)
    //格式化过滤   cellFilter
    .filter('mapGender', function() {
        var genderHash = {
            1: 'male',
            2: 'female'
        };

        return function(input) {
            if (!input){
                return '';
            } else {
                return genderHash[input];
            }
        };
    })

    .filter('mapStatus', function() {
        var genderHash = {
            1: 'Bachelor',
            2: 'Nubile',
            3: 'Married'
        };

        return function(input) {
            if (!input){
                return '';
            } else {
                return genderHash[input];
            }
        };
    });

    UiGridTreeController.$inject = ['$scope', '$http', '$timeout', '$interval', 'uiGridConstants'];

    function UiGridTreeController ($scope, $http, $timeout, $interval, uiGridConstants) {
        //拖拽
        $scope.dragEnable = true;
        $scope.msg = {};
        $scope.gridOptions = {
            rowTemplate: '<div grid="grid" class="ui-grid-draggable-row" draggable="true">' +
            '<div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell"' +
            ' ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader, \'custom\': true }" ui-grid-cell></div></div>',
            columnDefs:[
                { name: 'edit', width: '10%', cellTemplate:'<button type="button" id="editBtn" class="btn btn-small" ng-click="grid.appScope.remove(row)">删除</button>' ,enableCellEdit: false,enableColumnMenu: false },
                { name: 'id', enableCellEdit: false, width: '10%',cellTooltip: true, headerTooltip: true ,enableColumnMenu: false  },
                { name: 'name', displayName: 'Name (editable)', width: '20%',cellTooltip: true, headerTooltip: true,enableColumnMenu: false  },
                { name: 'age', displayName: 'Age' , type: 'number', width: '10%',cellTooltip: true, headerTooltip: true,enableColumnMenu: false   },
                { name: 'gender', displayName: 'Gender', editableCellTemplate: 'ui-grid/dropdownEditor', width: '20%',
                    cellFilter: 'mapGender', editDropdownValueLabel: 'gender', cellTooltip: true, headerTooltip: true,enableColumnMenu: false,
                    editDropdownOptionsArray: [
                        { id: 1, gender: 'male' },
                        { id: 2, gender: 'female' }
                    ] },
                { name: 'registered', displayName: 'Registered' , type: 'date', cellFilter: 'date:"yyyy-MM-dd"', width: '20%',enableColumnMenu: false },
                { name: 'address', displayName: 'Address', type: 'object', cellFilter: 'address', width: '30%',cellTooltip: true, headerTooltip: true,enableColumnMenu: false  },
                { name: 'address.city', displayName: 'Address (even rows editable)', width: '20%',cellTooltip: true, headerTooltip: true,enableColumnMenu: false,
                    cellEditableCondition: function($scope){
                        return $scope.rowRenderIndex%2
                    }
                },
                { name: 'isActive', displayName: 'Active', type: 'boolean', width: '10%',enableColumnMenu: false },
                { name: 'pet', displayName: 'Pet', width: '20%', editableCellTemplate: 'ui-grid/dropdownEditor',enableColumnMenu: false,
                    editDropdownRowEntityOptionsArrayPath: 'foo.bar[0].options', editDropdownIdLabel: 'value',cellTooltip: true, headerTooltip: true
                },
                { name: 'status', displayName: 'Status', width: '15%', editableCellTemplate: 'ui-grid/dropdownEditor',
                    cellFilter: 'mapStatus',enableColumnMenu: false,
                    editDropdownOptionsFunction: function(rowEntity, colDef) {
                        var single;
                        var married = {id: 3, value: 'Married'};
                        if (rowEntity.gender === 1) {
                            single = {id: 1, value: 'Bachelor'};
                            return [single, married];
                        } else {
                            single = {id: 2, value: 'Nubile'};
                            return $timeout(function() {
                                return [single, married];
                            }, 100);
                        }
                    }
                },
                { name: 'filename', displayName: 'File', width: '15%', editableCellTemplate: 'ui-grid/fileChooserEditor',
                    editFileChooserCallback: $scope.storeFile,cellTooltip: true, headerTooltip: true,enableColumnMenu: false   }
            ],
            onRegisterApi:function(gridApi){
                //set gridApi on scope
                $scope.gridApi = gridApi;
                gridApi.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
                    $scope.msg.lastCellEdited = 'edited row id:' + rowEntity.id + ' Column:' + colDef.name + ' newValue:' + newValue + ' oldValue:' + oldValue ;
                    $scope.$apply();
                });
                //拖拽
                $scope.$watch('dragEnable', function (newValue, oldValue) {
                    gridApi.dragndrop.setDragDisabled(!newValue);
                });
            },
            enableRowSelection: false,
            //enableRowHeaderSelection: true,
        /*    multiSelect:false,
            modifierKeysToMultiSelect:false,*/

            rowHeight: 30,
            //showGridFooter:true,
            paginationPageSize:15,
            paginationPageSizes:[5, 15, 25]

        };
        //上传文件并存储
        $scope.storeFile = function( gridRow, gridCol, files ) {
            // ignore all but the first file, it can only select one anyway
            // set the filename into this column
            gridRow.entity.filename = files[0].name;

            // read the file and set it into a hidden column, which we may do stuff with later
            var setFile = function(fileContent){
                gridRow.entity.file = fileContent.currentTarget.result;
                // put it on scope so we can display it - you'd probably do something else with it
                $scope.lastFile = fileContent.currentTarget.result;
                $scope.$apply();
            };
            var reader = new FileReader();
            reader.onload = setFile;
            reader.readAsText( files[0] );
        };


        var fData="";
        var nData="";
        //首次加载数据
        function load(){
            $http.get('/app/demo/uigrid/10_complex.json')
                .success(function(data1) {
                    for(i = 0; i < data1.length; i++){
                        data1[i].registered = new Date(data1[i].registered);
                        data1[i].gender = data1[i].gender==='male' ? 1 : 2;
                        if (i % 2) {
                            data1[i].pet = 'fish'
                            data1[i].foo = {bar: [{baz: 2, options: [{value: 'fish'}, {value: 'hamster'}]}]}
                        }
                        else {
                            data1[i].pet = 'dog'
                            data1[i].foo = {bar: [{baz: 2, options: [{value: 'dog'}, {value: 'cat'}]}]}
                        }
                    }
                    $scope.gridOptions.data = data1;
                    // $interval whilst we wait for the grid to digest the data we just gave it
                    //$interval( function() {$scope.gridApi.selection.selectRow($scope.gridOptions.data[0]);}, 0, 1);
                    fData=data1
                });
        }
        //替换数据
        function changeload(){
            $http.get('/app/demo/uigrid/10_complex_1.json')
                .success(function(data2) {
                    for(i = 0; i < data2.length; i++){
                        data2[i].registered = new Date(data2[i].registered);
                        data2[i].gender = data2[i].gender==='male' ? 1 : 2;
                        if (i % 2) {
                            data2[i].pet = 'fish'
                            data2[i].foo = {bar: [{baz: 2, options: [{value: 'fish'}, {value: 'hamster'}]}]}
                        }
                        else {
                            data2[i].pet = 'dog'
                            data2[i].foo = {bar: [{baz: 2, options: [{value: 'dog'}, {value: 'cat'}]}]}
                        }
                    }
                    $scope.gridOptions.data = data2;
                    // $interval whilst we wait for the grid to digest the data we just gave it
                    //$interval( function() {$scope.gridApi.selection.selectRow($scope.gridOptions.data[0]);}, 0, 1);
                    nData=data2;
                });
        }
        load();
        //替换
        $scope.swapData = function() {
            if ($scope.gridOptions.data === fData) {
                changeload();
            }
            else {
                $scope.gridOptions.data = fData;
            }
        };
        //添加
        $scope.addData = function() {
            var n = $scope.gridOptions.data.length;
            $scope.gridOptions.data.push({
                "id": n,
                "guid": "9f507483-5ecc-4af4-800f-349306820585",
                "isActive": false,
                "balance": "$2,407.00",
                "picture": "http://placehold.it/32x32",
                "age": 22,
                "name": "Nieves Mack",
                "gender": "male",
                "company": "Oulu",
                "email": "nievesmack@oulu.com",
                "phone": "+1 (812) 535-2614",
                "address": {
                    "street": 155,
                    "city": "Cherokee",
                    "state": "Kentucky",
                    "zip": 4723
                },
                "about": "Culpa anim anim nulla deserunt dolor exercitation eu in anim velit. Consectetur esse cillum ea esse ullamco magna do voluptate sit ut cupidatat ullamco. Et consequat eu excepteur do Lorem aute est quis proident irure.\r\n",
                "registered": "1989-07-26T15:52:15+05:00",
                "friends": [
                    {
                        "id": 0,
                        "name": "Brewer Maxwell"
                    },
                    {
                        "id": 1,
                        "name": "Ayala Franks"
                    },
                    {
                        "id": 2,
                        "name": "Hale Nichols"
                    }
                ]
            });
        };
        //删除
        $scope.remove = function(row){
            var index = $scope.gridOptions.data.indexOf(row.entity);
            //console.log(index);
            $scope.gridOptions.data.splice(index,1);
        };
        //重置
        $scope.reset = function () {
            load();
        }


        //多选
       /* $scope.toggleMultiSelect = function() {
            $scope.gridApi.selection.setMultiSelect(!$scope.gridApi.grid.options.multiSelect);
        };*/

        //全选
        $scope.selectAll = function() {
            $scope.gridApi.selection.selectAllRows();
        };
        //全不选
        $scope.clearAll = function() {
            $scope.gridApi.selection.clearSelectedRows();
        };
        //切换某一行选中
        $scope.toggleRow1 = function() {
            $scope.gridApi.selection.toggleRowSelection($scope.gridOptions.data[0]);
        };

       /* $scope.toggleFullRowSelection = function() {
            $scope.gridOptions.enableFullRowSelection = !$scope.gridOptions.enableFullRowSelection;
            $scope.gridApi.core.notifyDataChange( uiGridConstants.dataChange.OPTIONS);
        };*/

        /*$scope.setSelectable = function() {
            $scope.gridApi.selection.clearSelectedRows();

            $scope.gridOptions.isRowSelectable = function(row){
                if(row.entity.age > 30){
                    return false;
                } else {
                    return true;
                }
            };
            $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.OPTIONS);

            $scope.gridOptions.data[0].age = 31;
            $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);
        };*/

    };

