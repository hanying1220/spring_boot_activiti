(function() {
    'use strict';

    angular
        .module('erpApp')
        .controller('NavbarController', NavbarController);

    NavbarController.$inject = ['$scope','$rootScope','$state', 'Auth', 'Principal', 'ProfileService','layer','JhiLanguageService', '$translate'];

    function NavbarController ($scope, $rootScope, $state, Auth, Principal, ProfileService,layer,JhiLanguageService, $translate) {
        var vm = this;

       /*修改密码*/
        vm.changePassword = changePassword;
        vm.doNotMatch = null;
        vm.error = null;
        vm.success = null;

        Principal.identity().then(function(account) {
            vm.account = account;
        });

        function changePassword () {
            if (vm.password !== vm.confirmPassword) {
                vm.error = null;
                vm.success = null;
                vm.doNotMatch = 'ERROR';
            } else {
                vm.doNotMatch = null;
                Auth.changePassword(vm.password).then(function () {
                    vm.error = null;
                    vm.success = 'OK';
                }).catch(function () {
                    vm.success = null;
                    vm.error = 'ERROR';
                });
            }
        }
        /*修改密码*/


        /*用户设置*/
        vm.set={};
        vm.set.error = null;
        vm.set.save = save;
        vm.set.settingsAccount = null;
        vm.set.success = null;

        /**
         * Store the "settings account" in a separate variable, and not in the shared "account" variable.
         */
        var copyAccount = function (account) {
            return {
                activated: account.activated,
                email: account.email,
                name: account.name,
                langKey: account.langKey,
                login: account.login
            };
        };

        Principal.identity().then(function(account) {
            vm.set.settingsAccount = copyAccount(account);
        });

        function save () {
            Auth.updateAccount(vm.set.settingsAccount).then(function() {
                vm.set.error = null;
                vm.set.success = 'OK';
                Principal.identity(true).then(function(account) {
                    vm.set.settingsAccount = copyAccount(account);
                });
                JhiLanguageService.getCurrent().then(function(current) {
                    if (vm.set.settingsAccount.langKey !== current) {
                        $translate.use(vm.set.settingsAccount.langKey);
                    }
                });
            }).catch(function() {
                vm.set.success = null;
                vm.set.error = 'ERROR';
            });
        }
        /*用户设置*/
        vm.isNavbarCollapsed = true;
        vm.isAuthenticated = Principal.isAuthenticated;

        ProfileService.getProfileInfo().then(function(response) {
            vm.inProduction = response.inProduction;
            vm.swaggerEnabled = response.swaggerEnabled;
        });

        vm.logout = logout;
        vm.toggleNavbar = toggleNavbar;
        vm.collapseNavbar = collapseNavbar;
        vm.$state = $state;
        $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            $scope.currentName = $state.current.data.pageTitle;
        })


        function logout() {
            collapseNavbar();
            Auth.logout();
            $state.go('login');
        }

        function toggleNavbar() {
            vm.isNavbarCollapsed = !vm.isNavbarCollapsed;
        }

        function collapseNavbar(flag) {
            vm.isNavbarCollapsed = true;
            if(flag==2){
                $scope.userDailog=layer.open({
                    type: 1,
                    title:  '修改密码',
                    area   : ['400px', '365px'],
                    contentUrl: 'app/layouts/navbar/dialog/password.html',
                    scope:$scope
                });
            }else if(flag==1){
                $scope.userDailog=layer.open({
                    type: 1,
                    title: '账户设置',
                    area   : ['400px', '365px'],
                    contentUrl: 'app/layouts/navbar/dialog/settings.html',
                    scope:$scope
                });
            }

        }

        vm.account = null;
        $scope.$on('authenticationSuccess', function() {
            //console.log("success");
            getAccount();
        });

        getAccount();

        function getAccount() {
            Principal.identity().then(function(account) {
                vm.account = account;
                vm.isAuthenticated = Principal.isAuthenticated;
            });
        }
    }
})();
