'use strict';

var domReady = require('./util').domReady
    , resService = require('./resource')
    , Bubbles = require('./Bubbles')
    , BubRow = require('./BubRow')
    , BubblesMap = require('./BubblesMap');

var c = createjs
    , stage
    , WIDTH 
    , HEIGHT
    , mouse_pos
    , bubblesMap
    , radius = 27;

domReady(function init() {

    stage = new c.Stage( 'canvas' );    
    // Loading resource
    resService.init(prepareWorld); 

    stage.addEventListener('stagemouseup', handleMouseUp);

    // stage
    c.Ticker.setFPS( 60 );
    c.Ticker.addEventListener('tick', function(){
        stage.update();
    });
    
});


//Prepare the bubble map
function prepareWorld() {
    // TODO: Will resiaze the windows
    WIDTH = stage.canvas.width;
    HEIGHT = stage.canvas.height;

    // 初始地图
    bubblesMap = new BubblesMap( 14, 6, 11 );

    stage.addChild( bubblesMap );

    drawArror();

    // test move down and add a ros
    //  setTimeout( function() {
    //     bubMap.moveBubMap();
    // }, 1000);
   
}

// TODO :要把配置参数放在一起
// 球的列表地图的控制器
var bubMap = {
    start_rows : 0,
    total_rows : 0,
    all_rows : [],
    init : function( rows ) {

        // 设置初始的行数
        bubMap.start_rows = rows;

        for(var row = 0; row < bubMap.start_rows; row++ ){
            bubMap.addBubRow();
        }        
    },
    moveBubMap : function() {
        var cur
            , i
            , len = bubMap.all_rows.length;

        // 整体下滑
        for( i=0; i < len; i++ ) {
            cur = bubMap.all_rows[i];
            cur.moveDown();
        }

        // 添加一行
        bubMap.addBubRow();      
    },
    addBubRow : function() {
        var bubRow
            , lineX
            , lineY
            , total = bubMap.total_rows
            , start = bubMap.start_rows;  

        // 添加一行
        lineX = ( total%2 ) ? radius : 0;

        if( start > total ) {
            lineY = ( start - total ) * radius * 2;
        } else {
            lineY = radius * 2;
        }

        bubRow = new BubRow( lineX, lineY );

        bubMap.all_rows.push( bubRow );
        stage.addChild( bubRow );

        bubMap.total_rows++;        
    }

}


// shoot bullet.
var bullet = {
    cur : {},
    create: function() {
        bullet.cur = new Bubbles( WIDTH/2, HEIGHT - 100 );
        stage.addChild( bullet.cur );
    },
    shoot: function() {
        // console.log('shoot');

        // console.log('bullet.cur', bullet.cur.getPos());
        // console.log('mouse', mouse_pos);
        c.Tween.get( bullet.cur )
          .to( {x: stage.mouseX, y:  stage.mouseY}, 900, createjs.Ease.easeIn);

        // elasticOut bounceOut
        setTimeout( function(){
            bullet.create();
        }, 500);
        
    }
}

// 绘制前头图片
function drawArror() {

    var arrow = resService.getBitmap( "shooting_arm" );

    arrow.x = WIDTH/2;
    arrow.y = HEIGHT - 100;
    arrow.regX = arrow.width >> 1;
    arrow.regY = arrow.height;
    arrow.scaleX = arrow.scaleY = 0.6;

    stage.on('stagemousemove', faceMousePointer);
    function faceMousePointer() {

        mouse_pos = {
            x: stage.mouseX,
            y: stage.mouseY
        };
        var angle = Math.atan2( ( mouse_pos.x - arrow.x ), ( arrow.y - mouse_pos.y ) )*(180/Math.PI);

        if( angle > -90 && angle < 90 ) {
            arrow.rotation = angle;     
        }
           
    }
    
    stage.addChild( arrow );
    bullet.create();

}

//前头的鼠标跟踪
function handleMouseUp() {
    bullet.shoot();
}