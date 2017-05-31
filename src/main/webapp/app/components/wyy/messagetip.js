'use strict';
angular.module('ui.wyy.messagetip', [])
/**
 * @ngdoc service
 * @name ui.wisoft.messagetip.wiMessageTip
 *
 * @description
 * 消息提示窗口
 *
 * 主要功能：<br>
 * （1）支持自定义弹出位置<br>
 * （2）支持内容自定义HTML<br>
 */
    .service('wiMessageTip', ['$document','$timeout','$injector',function ($document,$timeout,$injector) {
        var tipParent=angular.element(window.parent.document.body);
        var tips = [];//窗口列表
        var tip = null;
        var tip_index = 1;//用于生成窗口id
        var _opts;

        /**
         * @ngdoc method
         * @name ui.wisoft.messagetip.wiMessageTip#open
         * @methodOf ui.wisoft.messagetip.wiMessageTip
         * @description 打开消息提示窗口
         *
         * @param {Object} options
         * {<br>
         *  width : Number类型，[可选]窗口宽度，默认自适应<br>
         *  height : Number类型，[可选]窗口高度，默认自适应<br>
         *  title : String类型，标题<br>
         *  position  : String类型，消息框位置，bottom或right<br>
         *  content  : String类型，消息内容，可以使普通字符串或HTML<br>
         *  isshake  : Boolean类型，[可选]弹出窗口后是否抖动，不支持IE9<br>
         *  delay  : Number类型，[可选]弹出窗口后是否延迟自动关闭，单位秒<br>
         *  click : Function类型，[可选]窗体点击回调，可以根据回调方法参数获取具体点击对象<br>
         *  }
         *
         * @return {String} id 弹出框的id
         *
         */
        this.open = function(opts) {
            //初始化参数
            var dest_opts = {
                width: 'auto',
                height: 'auto',
                title: '消息',
                position: 'bottom',
                isshake: false,
                delay: 0,
                click: null
            }
            angular.extend(dest_opts, opts);
            _opts = dest_opts;

            //创建并初始化消息框
            tip = angular.element(generateHTML());
            tip.bind('click', clickHandler);
            tip.data('$id', 'wiMessageTip_'+tip_index++);
            tipParent.append(tip);

            //滑入特效
            tip.css('bottom', '-500px');
            tip.css('right', '-500px');
            if (opts.position == 'bottom') {
                tip.css('right', '5px');
                tip.css('bottom', tip[0].clientHeight+'px');
                tip.css('transition', 'bottom 1s');
                tip.css('bottom', '5px');
            } else if (opts.position == 'right') {
                tip.css('bottom', '5px');
                tip.css('right', tip[0].clientWidth+'px');
                tip.css('transition', 'right 1s');
                tip.css('right', '5px');
            }

            //抖动特效
            if (_opts.isshake) {
                $timeout(function(){
                    tip.css('animation', 'shake-hard 1s');
                    tip.css('-webkit-animation', 'shake-hard 1s');
                }, 1000);
            }

            tips.push(tip);
            return tip.data('$id');
        }

        /**
         * @ngdoc method
         * @name ui.wisoft.messagetip.wiMessageTip#closeOne
         * @methodOf ui.wisoft.messagetip.wiMessageTip
         * @description 关闭消息提示窗口
         *
         * @param {String} id 窗口id
         *
         */
        this.closeOne = function(tipid) {
            closeTip(tipid);
        }

        function clickHandler(e) {
            var isCloseBtn = angular.element(e.target).hasClass('wi-messagetip-close');
            if (isCloseBtn) {
                closeTip(tip.data('$id'));
            } else if (_opts.click != null) {
                _opts.click.$inject = ['e'];
                $injector.invoke(_opts.click,{},{'e':e});
            }
        }

        function closeTip(tipid) {
            tip.unbind('click', clickHandler);
            if (_opts.position == 'bottom') {
                tip.css('bottom', -tip[0].clientHeight + 'px');
            } else if (_opts.position == 'right') {
                tip.css('right', -tip[0].clientWidth + 'px');
            }
            $timeout(function () {
                for (var i=0; i<tips.length; i++) {
                    if (tipid == tips[i].data('$id')) {
                        tips.splice(i, 1);
                        break;
                    }
                }
                tip.remove();
                tip = null;
                if (tips.length > 0) {
                    tip = tips[tips.length-1];
                }
            }, 1000);
        }

        function generateHTML() {
            var w = angular.isNumber(_opts.width)?_opts.width+'px':_opts.width;
            var h = angular.isNumber(_opts.height)?_opts.height+'px':_opts.height;
            var html = [
                '<div class="wi-messagetip-box" style="width:'+w+';height:'+h+';">',
                    '<div class="wi-messagetip-head">'+_opts.title+'<span class="wi-messagetip-close icon-remove"></span></div>',
                    '<div class="wi-messagetip-content">'+_opts.content+'</div>',
                '</div>'
            ];

            if (_opts.delay > 0) {
                $timeout(function(){
                    closeTip();
                }, _opts.delay*1000);
            }

            return html.join('');
        }
    }]
);
