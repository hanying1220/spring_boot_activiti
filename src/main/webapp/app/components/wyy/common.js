
angular.module('ui.wyy.common', [])
    //.config(wiResetHttpProvider)//解决使用$http.post时,springmvc后台获取不到参数的问题。
    .factory('wiCommonSev',[function(){
        return{
            // 尺寸类型的属性处理方法（其他组件中也存在类似方法，依赖于 scope），可接受的值：数字、数字开头、scope 对象（数字、数字开头）
            getSizeFromAttr :function(attr, scope){
                if(!attr) return;
                var size;
                if(/^(?:[1-9]\d*|0)(?:.\d+)?/.test(attr)){// 数字开始
                    size = attr;
                }else if(scope){// 非数字开始，可能是 scope 对象
                    size = scope.$eval(attr);
                }
                Number(size) && (size += 'px');// 是数字则加上单位 px
                return size;
            }
        };
    }]);
