
'use strict';


// module.exports = QueneEnginer;
var QueneEnginer = module.exports = function(){  //队列构造器
    this.Quene = [];        //队列数组
};

QueneEnginer.prototype = {
    processTime : 20,
    /**
     * 添加事件到队列中
     * @param {function} fn 函数对象
     * @param {object} context 上下文对象 可为空
     * @param {array} arrParam 参数数组 可为空
     */
    add : function( fn,context,arrParam ){
 
        this.Quene.push(    //添加一个事件
            {
                fn : fn,
                context : context,
                param : arrParam
            }
        );
    },
    start : function(){     //开始执行
        var that = this;
        setTimeout(function(){that.process();},that.processTime);
    },
    process : function(){   //执行事件过程
         
        var quene = this.Quene.shift();     //取出事件队列的第一个，
                                            //并且从this.Quene中删除这个事件
         
        if(!quene)return ;//如果队列里一个事件都没有，不继续往下执行，结束运行
 
        quene.fn.apply(quene.context,quene.param);//执行事件
         
        quene = null;//清除quene对象
         
        this.start();//继续调用start，直到队列为空时，结束
    }
};