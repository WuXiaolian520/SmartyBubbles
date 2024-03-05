/*
 * 统计游戏数据
 * 1：总分数
 * 2：总消球数
 * 3：发射次数
 * 4：命中数
 * 5：最大一次消球数
 * 传过来的数据：一次消球的数组，保存这发射球的rc和消球的rc
 */
'use strict';


var C = require('./config')
    , resService = require('./resource');

var c = createjs;

var EventDispatcher = c.EventDispatcher
    , EaselEvent = c.EaselEvent;

var hud;

var isHit = false
    , basic = {
        score : 0,
        count : 0
    }
    , total = {
        ballsShoot : 0,
        hitShoot : 0,
        hitRatio : 0,
        bubbleCleared : 0,
        largetsGroup : 0,
        shootScore : 0
    };

var hudService = module.exports = {
    init: hud_init,
    get: hud_get,
    getValue : hud_value,
    clear : hud_clear
};


function hud_init ( x, y ) {

    EventDispatcher.initialize( hudService );

    hud = new c.Container();
    hud.x = x;
    hud.y = y;

    resetParam();

    updateDigit();

    total = {
        ballsShoot : 0,
        hitShoot : 0,
        hitRatio : 0,
        bubbleCleared : 0,
        largetsGroup : 0,
        shootScore : 0
    };

    basic = {
        score : 0,
        count : 0
    };
    // 一次发射后开始记录
    this.on( 'record', onRecord );

    // 更新一次消球后更新分数和数量
    this.on( 'update', onUpdate );

    // 发射结束后，更新所有的高级参数
    this.on( 'statistics', onStatistics );
} 


function hud_value() { 
    
    return total;
}


function hud_clear() {

    hudService.removeAllEventListeners();
}

function resetParam() {

    if( !total ) return;

    for( var v in total ) {
        total[v] = 0;
    };
};


// 标记一次发射后统计开始
function onRecord( event ) {

    if( !event.data ) return;

    // 把基础数据初始化
    for( var i in basic ) {
        basic[i] = 0;
    };

    // 标记发射次数
    
    total.ballsShoot ++;
    // console.log('---> on record : total.ballsShoot = ', total.ballsShoot ); 

};


// 更新一次消球后更新分数和数量
function onUpdate( event ) {

    if( !event.data ) return;

    // console.log('---> on onUpdate : event.data = ', event.data);
    basic.score += event.data;
    basic.count ++;

    // console.log('---> on onUpdate : basic.score = ', basic.score ); 
}

function onStatistics( event ) {

    if( !event.data ) return;

    if( basic.count ) {

        total.hitShoot ++;
        total.bubbleCleared += basic.count;
        total.shootScore += basic.score;

        total.hitRatio = parseInt(( total.hitShoot / total.ballsShoot ) * 100);
        total.largetsGroup = ( total.largetsGroup < basic.count ) ? basic.count : total.largetsGroup;

        // console.log('---> on onStatistics : total = ', total ); 
        // 更新显示
        updateDigit();
    }
}

// Make number to array
function processNumber() {

    var res = '0000000'
        , score
        , tem = '';

    if( total.shootScore > 0 ) {

        score = total.shootScore.toString();
        for( var i= 0; i < res.length - score.length ; i++ ) {
            tem += '0';
        }

        res = tem + score;      
    }

    return res;
}

function updateDigit() {

    // 七个数字的位置
    var arr = processNumber()
        , number, i;

    hud.removeAllChildren();

    for( i = arr.length-1; i != -1; --i ) {

        number = getGigit( parseInt( arr[i] ) );

        if( number ) {

            number.x = hud.x + number.width * i
            number.y = hud.y + ( number.height>>1 );
            number.regX = number.width >> 1;
            number.regY = 0;

            c.Tween.get( number ).wait(10*(arr.length-i)).to( {scaleX: 1, scaleY: 1}, 200 + 30*(arr.length-i) , c.Ease.quartlnOut );

            hud.addChild( number );
        }

    }

}

function hud_get() {
    return hud;
}


function getGigit( number ) {

    if( 'number' != typeof(number ) ) return null;

    var name = C.img.digit[ number ];

    number = resService.getBitmap( name );
    number.scaleX = 0.5;
    number.scaleY = 0;
    
    return number;
}