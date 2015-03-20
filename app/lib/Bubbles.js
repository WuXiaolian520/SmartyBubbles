/*
 * Bubbles class
 */

'use strict';

var createSubClass = require('./util').createSubclass
    , Container = createjs.Container;

module.exports = createSubClass(Container, 'Bubbles', {
    initialize: Bubbles$initialize
});

var _radius = 27;

function Bubbles$initialize(x, y) {
    
    Container.prototype.initialize.apply(this, arguments);
    this.x = _radius * x;
    this.y = _radius * y;

    _prepareBubble.call(this, x, y);
    this.on( 'tick', handlTick );

}


function _prepareBubble( ix, iy ) {

    var bubbles = ["bubble1", "bubble2","bubble3","bubble4","bubble5","bubble6"];

    var randomBubbles = bubbles[Math.random() * bubbles.length | 0];

    this.body = setBitmap( randomBubbles);

    this.body.scaleX = this.body.scaleY = 0.1;
    this.body.x = _radius + _radius * ix;
    this.body.y = _radius + _radius * iy;
    this.body.regX = this.body.width >> 1;
    this.body.regY = this.body.height >> 1;

    this.body.x = (iy%2===0)?(this.body.x + 26):this.body.x ;

    this.addChild(this.body); 
   
}


function handlTick( event ) {
    var _value = this.body.scaleX; 
    if ( _value < 1 ) {
        this.body.scaleX += 0.05;
        this.body.scaleY += 0.05;
    } 
}

/*
 * @param
 */
function setBitmap( name) {

    var frame = getFrames(name);    
    
    var bitmap = new createjs.Bitmap('res/sprites_1.png');
    bitmap.width = frame[2];
    bitmap.height = frame[3];
    bitmap.sourceRect = new createjs.Rectangle(frame[0], frame[1], frame[2], frame[3]);

    return bitmap;
}


function getFrames(name) {
    var sprites_1 = {
        "images": ['res/sprites_1.png'],        
        "animations": {
            "bubble1": [0],
            "bubble2": [1],
            "bubble3": [2],
            "bubble4": [3],
            "bubble5": [4],
            "bubble6": [5],
            "bubble_empty": [6],
            "bubble_null": [7],
            "shooting_arm": [8]
        },
        "frames": [
            [305,336,54,54],
            [259,280,54,54],
            [259,224,54,54],
            [258,456,54,54],
            [198,60 ,54,54],
            [198,4  ,54,54],
            [314,446,50,50],
            [305,392,50,50],
            [4,4,110,377]
        ]
    };
    var index = sprites_1.animations[name];

    return sprites_1.frames[index];
}