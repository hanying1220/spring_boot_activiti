'use strict';

/* Controllers */

angular.module('erpApp')
  .controller('AppCtrl', ['$scope', '$translate', '$localStorage', '$window',
    function($scope,   $translate,   $localStorage,   $window ) {
      // config
      $scope.app = {
        name: '企业资源管理系统',
        version: 'V1.0',
        settings: {
          headerFixed: true,
          asideFixed: false,
          asideFolded: false,
          asideDock: false,
          container: false
        }
      }
      // save settings to local storage
      if ( angular.isDefined($localStorage.settings) ) {
        $scope.app.settings = $localStorage.settings;
      } else {
        $localStorage.settings = $scope.app.settings;
      }
      $scope.$watch('app.settings', function(){
        if( $scope.app.settings.asideDock  &&  $scope.app.settings.asideFixed ){
              // aside dock and fixed must set the header fixed.
              $scope.app.settings.headerFixed = true;
          }
        // save to local storage
        $localStorage.settings = $scope.app.settings;
      }, true);

        // add 'ie' classes to html
        var isIE = !!navigator.userAgent.match(/MSIE/i);
        isIE && angular.element($window.document.body).addClass('ie');
        isSmartDevice( $window ) && angular.element($window.document.body).addClass('smart');

      function isSmartDevice( $window )
      {
          // Adapted from http://www.detectmobilebrowsers.com
          var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
          // Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
          return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
      }

  }]);
