(function() {
    'use strict';

    angular
        .module('erpApp')
        .controller('RegisterController', RegisterController);


    RegisterController.$inject = ['$translate', '$timeout', 'Auth', '$state', 'layer'];

    function RegisterController ($translate, $timeout, Auth, $state, layer) {
        var vm = this;

        vm.doNotMatch = null;
        vm.error = null;
        vm.errorUserExists = null;
        //vm.login = $state.go('login');
        vm.register = register;
        vm.registerAccount = {};
        vm.success = null;

        $timeout(function (){angular.element('#login').focus();});

        function register () {
            if (vm.registerAccount.password !== vm.confirmPassword) {
                //vm.doNotMatch = 'ERROR';
                layer.msg("您输入的密码和确认确认密码不匹配!");
            } else {
                vm.registerAccount.langKey = $translate.use();
                vm.doNotMatch = null;
                vm.error = null;
                vm.errorUserExists = null;
                vm.errorEmailExists = null;

                Auth.createAccount(vm.registerAccount).then(function () {
                    layer.msg("注册成功!请检查您的电子邮件.");
                }).catch(function (response) {
                    //console.log(response);
                    if (response.status === 400 && response.data === '账号已存在') {
                        layer.msg("账号已被注册!请选择其它账号.");

                    } else if (response.status === 400 && response.data === '邮箱已经存在') {
                        layer.msg("E-mail已经被注册!请选择其它E-mail");
                    } else {
                        layer.msg("注册失败!请稍后再试.");
                    }
                });
            }
        }
    }
})();
