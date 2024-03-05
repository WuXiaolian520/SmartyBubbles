/*
 * Bubbles class
 */

'use strict';

var createSubClass = require('./util').createSubclass
    , print = require('./util').print
    , Bitmap = createjs.Bitmap
    , C = require('./config')
    , hubService = require('./hud')
    , resService = require('./resource');

var c = createjs;

module.exports = createSubClass(Bitmap, 'Bubbles', {
    initialize: Bubbles$initialize,
    setPos: Bubbles$setPos,
    getPos: Bubbles$getPos,
    setRowCol: Bubbles$setRowCol,
    getRowCol: Bubbles$getRowCol,
    doDestroy: Bubbles$destroy,
    setNeighbors: Bubbles$setNeighbors,
    getNeighbors: Bubbles$getNeighbors,
    getType: Bubbles$getType,
    getFullRing: Bubbles$getFullRing,
    doCollision: Bubbles$doCollision,
    doMoveDown: Bubbles$doMoveDown,
    enable : Bubbles$enable,
    disable : Bubbles$disable

});


C.SCALE_SPEED = 400;
C.FAST_SPEED = 100;


function Bubbles$initialize( x, y , row, col, color ) {
   
    if( !color ) return print.error( C.error.no_param, 'at : Bubbles$initialize' );

    Bitmap.prototype.initialize.apply(this, arguments);

    this.setPos( x, y );
    this.setRowCol( row, col ); 

    var config = resService.getResConfig( C.img.colors[ color ] );

    if( !config ) 
        return print.error( C.error.error_setting, 'at : Bubbles$initialize' );

    _setConfig.call( this, config );  

    // 标记是否遍历过
    this._visit = 0;        
    // 标记
    this._connected = 1;  

    this.moving = 0;
    
    this.type = color;   

    this.neighbor = {
        'left':null, 'right':null, 'upleft': null, 
        'upright': null, 'downleft':null, 'downright':null
    };

    c.Tween.get( this ).to( { scaleX: 1, scaleY: 1 }, C.SCALE_SPEED , c.Ease.quartlnOut );

}


function Bubbles$enable( t, e, i, s ) {

    this.type = t, 
    this.radius = e, 
    this._posX = this.lastPosX = i, 
    this._posY = this.lastPosY = s, 
    this.connected = !1, 
    this.enabled = !0;

}

function Bubbles$disable() {
    this.enabled = this.moving = !1;
}

function Bubbles$setPos( x, y, row, col ) {
    this.x = x;
    this.y = y;
}


function Bubbles$getPos() {
    return {
        x: this.x,
        y: this.y
    }
}


function Bubbles$setRowCol( row, col ) {
    this.row = row;
    this.col = col;  
}


function Bubbles$getRowCol() {
    return {
        row: this.row,
        col: this.col
    }
}


function Bubbles$setNeighbors( dir, value ) {

    if ( value ) {

        this.neighbor[ dir ] = {
            pos : {
                row: value.row,
                col: value.col
            },
            type: value.type
        }; 

    } else {
        this.neighbor[ dir ] = value;
    }

}


// 查询球的邻居是否满员
function Bubbles$getFullRing () {

    return isFullRing.call(this);
}


function Bubbles$getNeighbors() {

    return this.neighbor;
}



function Bubbles$getType() {
    return this.type;
}

// 检测是否邻居已经满员
function isFullRing() {

    for( var pos in this.neighbor ) {

        if( null == this.neighbor[pos] ){

            return false;
        }
    }

    return true;
}   


function _setConfig( config ) {

    var frame = config.frame;

    this.image = config.url;

    this.sourceRect = new c.Rectangle( frame[0], frame[1], frame[2], frame[3] );
    this.width = frame[2];
    this.height = frame[3];
    this.radius = this.width / 2 ;
    this.scaleX = this.scaleY = 0.1;
    this.regX = this.width >> 1;
    this.regY = this.height >> 1;
}


function Bubbles$destroy( dis, index ) {

    if( null == dis || null == index ) return;

    var _score = C.img.score;

    var id = getScoreId( dis );

    var score = resService.getResConfig( _score[ id ] );
   
    c.Tween.get( this ).wait( index * C.FAST_SPEED  )
              .to( { scaleX: .1, scaleY: .1, alpha:0 }, C.FAST_SPEED  , c.Ease.quartlnOut)
              .call( _setConfig, [ score ], this )
              .to( { scaleX: 1, scaleY: 1 , alpha: 1 }, C.FAST_SPEED , c.Ease.quartlnOut)
              .to( { x: this.x, y: this.y - 27, alpha:0 }, 1000)
              .call( function() {
                    if( this.parent ) this.parent.removeChild( this );
                    this.removeAllEventListeners();
               });

    // 派发更新分数的统计
    hubService.dispatchEvent({
        type: 'update',
        data: parseInt( C.map.score[ id ] )
    });
}


function getScoreId( dis ) {

    var id;

    if( !dis ) dis = 1;

    id = Math.round( dis / 2 );  

    if( id > C.map.score.length ) id = C.map.score.length;

    return id-1;
}

function Bubbles$doCollision( index ) {

    if( null == index ) index = 1;

    if( !c.Tween.get( this ).hasActiveTweens ) {

        c.Tween.get( this ).wait( index * C.FAST_SPEED  )
                            .to( { y: this.y - 10 }, 800, c.Ease.circOut)
                            .to( { y: this.y }, 1500, c.Ease.circOut); 
    }
   
}


function Bubbles$doMoveDown( num ) {

    if( !num ) return console.warn('ERROR: 下移的行数出错！');

    this.setRowCol( this.row - num, this.col );
    var y = this.y + 2*27 * num;
    var old = 0;
    for( var i in this.neighbor ) {

        if( this.neighbor[i] ) {

            old = this.neighbor[i].pos.row;
            this.neighbor[i].pos.row = old - num;
        } 
    }    
    c.Tween.get( this ).to({ y: y }, 800, c.Ease.quartlnOut ).call( function() {
        this.setPos( this.x, y );
        return true;
    });

}

