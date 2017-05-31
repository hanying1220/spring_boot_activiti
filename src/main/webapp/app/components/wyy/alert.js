'use strict';
angular.module('ui.wyy.alert', ['ui.wyy.dialog'])

/**
 * @ngdoc service
 * @name ui.wisoft.alert.wiAlert
 *
 * @description
 * wiAlert 用来弹出常用的五种提醒弹出框：info,warning,error,success,confirm，它们有固定的图标和默认的标题，使用时仅需要指定提醒内容，当然你也可以自己指定标题。
 * wiAlert的弹出框都是模态的，它会中断用户的其它操作，请在适当的场景中使用。
 *
 */
    .factory('wiAlert',['$q','wiDialog',function($q,wiDialog){

        var privateMethods = {
            showAlert: function (opts,type) {
                var content,defaultIconClass,defaultTitle;
                //如果直接传递字符串，则将字符串作为提醒内容
                angular.isString(opts)? content=opts: content=opts.content;

                //各种类型Alert的默认图标
                defaultIconClass = {info:'icon-info-sign',error:'icon-remove-sign',warn:'icon-exclamation-sign',
                             success:'icon-ok-sign',confirm:'icon-question-sign'};

                //各种类型Alert的默认标题
                defaultTitle={info:'提示',warn:'警告',error:'失败',success:'成功','confirm':'提示'}

                var tpl =  ['<div class="wi-clearf">',
                     '<div class="wi-alert-icon" ><span class="' + (opts.iconClass||defaultIconClass[type]) + '"></span></div>',
                     '<div class="wi-alert-simple-cont" >' + content + '</div></div>',
                     '<div class="wi-alert-toolbar">',
                     '<input type="button" value='+(opts.yesLabel||"确定")+' ng-click=confirm("YES")'+' class="wi-btn" /></div>'
                ];

                //confirm有确定和取消两个按钮，其余只有确定一个按钮
                if(type==='confirm'){
                    tpl.splice(4, 0, '<input type="button" value='+(opts.noLabel||"取消")+' ng-click=confirm("NO")'+' class="wi-btn wi-dialog-okClose" />');
                }

                var options = {
                    closeByEscape: false,
                    closeByDocument: false,
                    overlay:true,
                    dialogInIframe:false,// 默认在顶层窗口弹出
                    plain: true,
                    title: opts.title||defaultTitle[type],
                    withoutHead:false,
                    width: opts.width||300,
                    template:tpl.join('')
                };
                  //不写下面这句是为了禁止覆盖某些属性
//                angular.extend(options, opts);

                var p = $q.defer(),yesFunc=angular.noop,noFunc=angular.noop;
                p.promise=wiDialog.openConfirm(options);
                p.promise.yes=function(callback){
                    yesFunc=callback;//设置点击确定后的回调函数
                    return p.promise;//支持链式调用
                }
                p.promise.no=function(callback){
                    noFunc=callback;//设置点击取消后的回调函数
                    return p.promise;//支持链式调用
                }
                p.promise.then(function(data){
                    data==='YES'?yesFunc():data==='NO'?noFunc():angular.noop();
                })
                //返回的promise里定义了yes和no方法用来设置回调函数，设置的回调函数在按钮点击事件发生后执行。
                return p.promise;
            }
        }
        //opts: width,yeslabel,nolabel,content,title,iconClass
        var publicMethods = {

            /**
             * @ngdoc method
             * @name ui.wisoft.alert.wiAlert#info
             * @methodOf ui.wisoft.alert.wiAlert
             * @description 一般信息提示框
             *
             * @param {Object} options 参见confirm的参数说明。
             *
             * @return {Object} 返回一个promise,可以直接在返回对象的.yes()中进行点击确定后的处理。
             *
             */
            info:function(opts){
                return privateMethods.showAlert(opts,'info');
            },
            /**
             * @ngdoc method
             * @name ui.wisoft.alert.wiAlert#warn
             * @methodOf ui.wisoft.alert.wiAlert
             * @description 警告信息提示框
             *
             * @param {Object} options 参见confirm的参数说明。
             *
             * @return {Object} 返回一个promise,可以直接在返回对象的.yes()中进行点击确定后的处理。
             *
             */
            warn:function(opts){
                return privateMethods.showAlert(opts,'warn');
            },
            /**
             * @ngdoc method
             * @name ui.wisoft.alert.wiAlert#error
             * @methodOf ui.wisoft.alert.wiAlert
             * @description 失败信息提示框
             *
             * @param {Object} options 参见confirm的参数说明。
             *
             * @return {Object} 返回一个promise,可以直接在返回对象的.yes()中进行点击确定后的处理。
             *
             */
            error:function(opts){
                return privateMethods.showAlert(opts,'error');
            },
            /**
             * @ngdoc method
             * @name ui.wisoft.alert.wiAlert#success
             * @methodOf ui.wisoft.alert.wiAlert
             * @description 操作成功信息提示框
             *
             * @param {Object} options 参见confirm的参数说明。
             *
             * @return {Object} 返回一个promise,可以直接在返回对象的.yes()中进行点击确定后的处理。
             *
             */
            success:function(opts){
                return privateMethods.showAlert(opts,'success');
            },
            /**
             * @ngdoc method
             * @name ui.wisoft.alert.wiAlert#confirm
             * @methodOf ui.wisoft.alert.wiAlert
             * @description 需要用户同意后才能进行其他操作的提示框。
             *
             * @param {Object} options 可以仅指定提示内容，也可以修改默认属性，可以修改的参数如下：<br>
             * {<br>
             * width： 提示框的宽度，默认为300<br>
             * title：提示框的标题，支持html值。各种alert的默认标题 {info:'提示',warn:'警告',error:'失败',success:'成功','confirm':'提示'}<br>
             * content：提示内容，支持html值，如：<span class="alertTitle">确定删除吗？</span><br>
             * iconClass：提示框内容区域的图标样式。<br>
             * yesLabel：按钮名称，默认为：确定<br>
             * noLabel：按钮名称，默认为：取消<br>
             *  }
             *
             *
             * @return {Object} 返回一个promise,可以直接在返回对象的.yes()或.no()中对确定或取消进行处理。
             *
             */
            confirm:function(opts){
                return privateMethods.showAlert(opts,'confirm');
            }
        };

        return publicMethods;
    }])
