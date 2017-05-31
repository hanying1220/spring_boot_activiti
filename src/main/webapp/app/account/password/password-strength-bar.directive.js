/* globals $ */
(function() {
    'use strict';

    angular
        .module('erpApp')
        .directive('passwordStrengthBar', passwordStrengthBar);

    function passwordStrengthBar () {
        var directive = {
            replace: true,
            restrict: 'E',
            template: '<div id="strength" class="row">' +
                '<label class="col-sm-3" data-translate="global.messages.validate.newpassword.strength">Password strength:</label>' +
                '<div class="col-sm-9"><ul id="strengthBar" class="col-sm-12">' +
                '<li class="point"></li><li class="point"></li><li class="point"></li>' +
                '</ul><b id="info"></b></div>' +
                '</div>',
            scope: {
                passwordToCheck: '='
            },
            link: linkFunc
        };

        return directive;

        /* private helper methods*/

        function linkFunc(scope, iElement) {
            var strength = {
                colors: ['#F00', '#f5a640', '#3ec03b'],
                infos:["较弱","较强","很强"],
                mesureStrength: function (p) {
                    var _force = 0;
                    var _regex = /[$-/:-?{-~!"^_`\[\]]/g; // "

                    var _lowerLetters = /[a-z]+/.test(p);           //小写
                    var _upperLetters = /[A-Z]+/.test(p);           //大写
                    var _numbers = /[0-9]+/.test(p);                //数字
                    var _symbols = _regex.test(p);                  //特殊字符

                    var _flags = [_lowerLetters, _upperLetters, _numbers, _symbols];
                    var _passedMatches = $.grep(_flags, function (el) {       //符合种类搭配
                        return el === true;
                    }).length;

                    _force += 2 * p.length + ((p.length >= 10) ? 1 : 0);      //密码长度加分规则
                    _force += _passedMatches * 10;                              //密码包括字符种类加分规则
                    //console.log(_force);

                    // penality (short password)
                    _force = (p.length <= 6) ? Math.min(_force, 10) : _force;     //密码小于6位数  为10 否则返回上述加分

                    // penality (poor variety of characters)
                    _force = (_passedMatches === 1) ? Math.min(_force, 10) : _force;       //包括几种字符类型加分规则
                    _force = (_passedMatches === 2) ? Math.min(_force, 20) : _force;
                    _force = (_passedMatches === 3) ? Math.min(_force, 40) : _force;
                    return _force;

                },
                getColor: function (s) {
                    console.log(s);
                    var idx;
                    if (s <= 10) {
                        idx = 0;
                    }
                    else if (s <= 40) {
                        idx = 1;
                    }
                    else {
                        idx = 2;
                    }

                    return { idx: idx + 1, col: this.colors[idx], infos:this.infos[idx] };
                }
            };
            scope.$watch('passwordToCheck', function (password) {
                if (password) {
                    //debugger
                    var c = strength.getColor(strength.mesureStrength(password));
                    console.log(c.infos +"---------"+ c.col);
                    iElement.removeClass('ng-hide');
                    iElement.find('ul').children('li')
                        .css({ 'background-color': '#DDD' })
                        .slice(0,iElement.find('ul').children('li').length)
                        .css({ 'background-color': c.col });
                    iElement.find("#info").html(c.infos).css({"color": c.col,"font-size":"14px"});
                }
            });
        }
    }
})();
