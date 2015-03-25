
/*
 * BubRow class
 * 1:能生成一整排的bubbles
 * 2:能通过container来奇偶交错的效果
 * 3:生成器能一下子生成一整排
 */

'use strict';

var createSubClass = require('./util').createSubclass
    , Bubbles = require('./Bubbles')
    , Container = createjs.Container;

// TODO :要把配置参数放在一起
// 初始时候的总的列数
var _COL = 11
    , radius = 27;

module.exports = createSubClass(Container, 'BubRow', {
    initialize: BubRow$initialize,
    setPos: BubRow$setPos,
    getPos: BubRow$getPos,
    moveDown: BubRow$moveDown
});

function BubRow$initialize( x, y, row ) {
    
    Container.prototype.initialize.apply(this, arguments);

    this.name = row;

    this.setPos( x, y );

    this.list = [];

    setLine.call( this, row );

    // this.addEventListener
}

// TODO: 圆的半径需要参数化
function setLine( row ) {

    var bubble
        , col = 0
        , bubX;

    for( ; col < _COL; col++ ) {

        bubX = radius * (1 + 2 * col);

        bubble = new Bubbles( bubX, 0 , col);
        this.list.push( bubble );
        this.addChild(bubble);
    }

    this.height = bubble.height;
}

// The all row could move to the next line
function BubRow$moveDown() {
    var curPos = this.getPos();

    createjs.Tween.get( this )
          .to( { y: curPos.y + 54 }, 700, createjs.Ease.quadOut );
}

function BubRow$setPos( x, y ) {

    this.x = this.gameX = x;
    this.y = this.gameY = y;
}


function BubRow$getPos() {
    return {
        x: this.gameX,
        y: this.gameY
    }
}


