
/*
 * Bubbles class
 */

'use strict';

var createSubClass = require('./util').createSubclass
    , Bitmap = createjs.Bitmap
    , resService = require('./resource');

var eventDispatcher = new createjs.EventDispatcher;

module.exports = createSubClass(Bitmap, 'Bubbles', {
    initialize: Bubbles$initialize,
    setPos: Bubbles$setPos,
    getPos: Bubbles$getPos,
    getRowCol: Bubbles$getRowCol,
    destroy: Bubbles$destroy,
    setNeighbors: Bubbles$setNeighbors,
    getNeighbors: Bubbles$getNeighbors,
    resetNeighbor: Bubbles$setNeighbors,
    getType: Bubbles$getType,
    getFullRing: Bubbles$getFullRing
});

var _type = {
    "bubble1" : 1,
    "bubble2" : 2,
    "bubble3" : 3,
    "bubble4" : 4,
    "bubble5" : 5,
    "bubble6" : 6,
};

var _bubbles = ["bubble1", "bubble2","bubble3","bubble4","bubble5","bubble6"];

function Bubbles$initialize( x, y , row, col ) {
    
    Bitmap.prototype.initialize.apply(this, arguments);

    this.setPos( x, y, row, col ); 
    this.neighbor = {
        'left':null,
        'right':null,        
        'upleft': null,
        'upright': null,
        'downleft':null,
        'downright':null
    };

    this._visit = false;

    var bub_name = _randomBubbleType.call(this);
    this.type = _type[bub_name];

    var config = resService.getResConfig( bub_name )
    _setConfig.call( this, config );

    this.on( 'tick', onBigger );

}


function Bubbles$setPos( x, y, row, col ) {

    this.x = x;
    this.y = y;
    this.row = row;
    this.col = col;   
}


function Bubbles$getPos() {
    return {
        x: this.x,
        y: this.y
    }
}


function Bubbles$getRowCol() {
    return {
        row: this.row,
        col: this.col
    }
}

// TODO :NOT WORK
function Bubbles$destroy() {
    this.on( 'rollover', onSmaller);
    console.log('destroyed');
}


function Bubbles$setNeighbors( pos, value ) {

    if ( value ) {
        this.neighbor[pos] = {
            x: value.x,
            y: value.y,
            type: value.type,
            row: value.row,
            col: value.col
        };        
    } else {
        this.neighbor[pos] = value;
    }

}


// 查询球的邻居是否满员
function Bubbles$getFullRing () {

    return isFullRing.call(this);
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

function Bubbles$getNeighbors() {

    return this.neighbor;
}

function Bubbles$resetNeighbor() {

    this.neighbor = {
        'upleft': null,
        'upright': null,
        'left':null,
        'right':null,
        'downleft':null,
        'downright':null
    };    
}


function Bubbles$getType() {
    return this.type;
}


function onSmaller( event ) {

    var _value = this.scaleX; 
    if ( _value < 1 ) {

        this.scaleX = this.scaleY -= 0.05;
    }    
}


function _setConfig( config ) {

    var frame = config.frame;

    this.image = config.url;

    this.sourceRect = new createjs.Rectangle( frame[0], frame[1], frame[2], frame[3] );
    this.width = frame[2];
    this.height = frame[3];

    this.scaleX = this.scaleY = 0.1;
    this.regX = this.width >> 1;
    this.regY = this.height >> 1;
}

function _randomBubbleType() {
    
    var name = _bubbles[Math.random() * _bubbles.length | 0];

    return name;//resService.getResConfig( name );
}


function onBigger( event ) {

    var _value = this.scaleX; 

    if ( _value < 1 ) {

        this.scaleX = this.scaleY += 0.05;
    } 
}


