'use strict';

var domReady = require('./util').domReady
    , resService = require('./resource')
    , C = require('./config')
    , Bubbles = require('./Bubbles')
    , BubblesMap = require('./BubblesMap')
    , hud = require('./hud')
    ;

var c = createjs
    , stage
    , WIDTH
    , HEIGHT
    , SHOOT_X
    , SHOOT_Y
    , playContainer
    , bubblesMap
    , currentLevel = 0
    , radius = 27;


var gameLogic = {

    state : {
        wait : 0,
        play : 1,
        paused : 2,
        end : 3
    },
    pageList : {
        main : 'MainMenu',
        over : 'over',
        statistics : 'statistics',
        paused : 'paused'
    },

    currentPage : null,
    currentState : null,

    main : menuPage,
    gameOver : overPage,
    statistics: statisticsPage,
    paused : pausedPage,
    success : successPage
};

// Main menu page
function menuPage() {

    var page
        , logo
        , title
        , btnPlay
        , btnStatistics;


    page = new c.Container( 0 , 0 );
    page.name = gameLogic.pageList.main;

    gameLogic.currentState = gameLogic.state.wait;
    gameLogic.currentPage = gameLogic.pageList.main;

    // ------- Begin to draw page -------

    // Smarty Bubble logo
    logo = resService.getBitmap( C.img.gameLogo );
    logo.x = ( WIDTH - logo.width ) / 2 ;
    logo.y = 20;
    page.addChild( logo );

    // Title
    title = resService.getBitmap( C.img.titleBubbles );
    title.x = ( WIDTH - title.width ) / 2;
    title.y = logo.height - 50 ;
    page.addChild( title );

    // Button
    btnPlay = buttonMaker( {
        y : title.y + title.height - 130,
        text : 'play'
    } );

    page.addChild( btnPlay );
    btnPlay.on( 'click' , toPlay );

    // Statistics
    btnStatistics = buttonMaker( {
        bg : C.img.buttonStatistics,
        y : btnPlay.y + 300,
        text : 'statistics',
        font : 'small',
        color : 'small',
        aglin : 'right'
    } );

    page.addChild( btnStatistics );

    // ------- End to draw page -------

    stage.addChild( page );
};

// Game over page.
function overPage() {

    // State
    if( gameLogic.currentState == gameLogic.state.play ) {
        gameLogic.currentState = gameLogic.state.end;
    } else {
        console.warn( 'game logic error' );
        return;
    }

    var page
        , title
        , tBounds
        , tab
        , numScore
        , btnContinue
        , values;

    stage.removeAllChildren();
    page = new c.Container( 0, 0 );
    page.name = gameLogic.pageList.over;

    gameLogic.currentPage = gameLogic.pageList.over;

    // ------- Begin to draw page -------

    // Title
    title = titleMaker( 'Game Over!');
    if( title ) page.addChild( title );

    // Score
    values = hud.getValue();
    if( !values ) return null;

    console.log( 'overPage values = ', values );
    numScore = new c.Text( values.shootScore + '', '80px Fantasy', "#fff" );

    if( numScore ){
        tBounds = numScore.getBounds();
        numScore.x = ( WIDTH - tBounds.width ) / 2;
        numScore.y = title.y + 150;
        page.addChild( numScore );

    } else {
        console.log('error');
    }


    var font = '40px Fantasy'
        , color = "#fff"
        , alpha = '0.6';

    function tabMaker( index, cell ) {
        var text
            , num
            , b;

        text = new c.Text( cell.tab, font, color );
        b = text.getBounds();
        text.x = 50;
        text.y = 350+ ( b.height + 50 ) * index;
        text.alpha = alpha;
        page.addChild( text );

        var str = cell.count;
        num = new c.Text( str.toString() , font, color );
        b = num.getBounds();
        num.x = WIDTH - b.width - 50;
        num.y = 350 + ( b.height + 50 ) * index;

        page.addChild( num );
    }

    var tabArray = [
        { tab:'Bubbles cleared', count : values.bubbleCleared },
        { tab:'Balls shot'     , count : values.hitShoot },
        { tab:'Hit ratio'      , count : values.hitRatio + '%' },
        { tab:'Largest group'  , count : values.largetsGroup }
    ];

    for( var i in tabArray ) {

        tabMaker( i, tabArray[i] );
    }

    // Button Continue
    btnContinue = buttonMaker( {
        y : HEIGHT - 250 ,
        text : 'Continue'
    } );

    btnContinue.on( 'click', toMenu );

    page.addChild( btnContinue );

    // ------- End to draw page -------

    stage.addChild( page );

};

function pausedPage() {

    console.log( '------------->pausedPage' );

    // State
    if( gameLogic.currentState == gameLogic.state.play ) {
        gameLogic.currentState = gameLogic.state.paused;
        if( stage.hasEventListener( 'stagemousedown' ) ) {
            console.log('removeEventListener stagemousedown');
            stage.removeEventListener( 'stagemousedown', queue.bullet.doShootAnimate );
        }
    } else {
        console.warn( '======>game logic error' );
        return null;
    }

    var page
        , pageGraphics
        , btnResume
        , btnRestart
        , btnMenu
        , text;

    page = new c.Container();
    pageGraphics = new c.Graphics().beginFill( "#01a8fe" ).drawRect( 0, 0, WIDTH, HEIGHT );
    page.addChild(new c.Shape()).set({ graphics: pageGraphics, x:0, y:0 });
    page.name = gameLogic.pageList.paused;
    gameLogic.currentPage = gameLogic.pageList.paused;

    text = titleMaker( "Paused" );
    if( text ) page.addChild( text );


    // Resume
    btnResume = buttonMaker( {
        y : text.y + 180,
        text : 'Resume'
    } );

    btnResume.on( 'click' , toResume );
    page.addChild( btnResume );

    // Restart
    btnRestart = buttonMaker( {
        y : btnResume.y + 180,
        text : 'Restart'
    } );

    btnRestart.on( 'click' , toPlay );
    page.addChild( btnRestart );

    // Main Menu
    btnMenu = buttonMaker( {
        y : btnRestart.y + 180,
        text : 'Main Menu'
    } );

    btnMenu.on( 'click' , toMenu );
    page.addChild( btnMenu );

    stage.addChild( page );
};


function statisticsPage() {

};


function successPage() {

}


function buttonMaker( options ) {

    var def = C.css.button.props;

    var props = {};
    /* Evaluate options */
    for(var name in def)
    {
        props[name] = (options !== undefined && options[name] !== undefined) ? options[name] : def[name];

    };

    var button
        , bg
        , text;

    button = new c.Container();

    bg = resService.getBitmap( props.bg );
    props.x = ( WIDTH - bg.width ) / 2;
    button.set( { x:props.x, y : props.y, width: bg.width, height : bg.height });
    button.addChild( bg );


    text = new c.Text( props.text, C.css.button.font[ props.font ] , C.css.button.color[ props.color ]);

    var b = text.getBounds();

    switch( props.aglin ) {
        case 'center':
            text.x = (button.width - b.width) / 2;
            break;
        case 'right' :
            text.x = button.width - b.width - 30;
            break;
    }

    text.y = (button.height - b.height) / 2;
    text.textBaseline = "hanging";

    button.addChild( text );

    return button;

};

function titleMaker( msg ) {

    if( !msg ) return null;

    var title
        , b;

    title = new c.Text( msg, C.css.title.font , C.css.title.color );
    b = title.getBounds();
    title.x = ( WIDTH - b.width ) / 2; // Make center.
    title.y = 60;

    return title;
}


function beforeToPage() {

    resService.radioSound( C.sound.tap );

    if( gameLogic.currentState != gameLogic.state.play ) {

        console.log('gameLogic.currentPage = ', gameLogic.currentPage);

        if( stage.hasEventListener( 'stagemousedown' ) ) {
            console.log('removeEventListener stagemousedown');
            stage.removeEventListener( 'stagemousedown', queue.bullet.doShootAnimate );
        }

        var current = stage.getChildByName( gameLogic.currentPage );
        stage.removeChild( current );
    }

}


function toPlay() {

    beforeToPage();

    clearAllElem();

    prepareWorld();
}



function toResume() {

    beforeToPage();

    gameLogic.currentState = gameLogic.state.play;

    if( !stage.hasEventListener( 'stagemousedown' ) ) {
        console.log('addEventListener stagemousedown');
        stage.addEventListener( 'stagemousedown', queue.bullet.doShootAnimate );
    }

}


function toMenu() {

    beforeToPage();

    clearAllElem();

    // 清除数据统计监听
    hud.clear();

    gameLogic.main();
}


function toPaused() {

    beforeToPage();

    gameLogic.paused();

}


function clearAllElem() {
    stage.removeAllChildren();
    stage.removeAllEventListeners();
}

// --------------------------------------------------
//
var line = {
    img : {},
    draw: drawKillLine,
    toggle :toggleVisible,
    over : toOver
};


function toOver() {

    clearAllElem();

    // 清除数据统计监听
    hud.clear();

    gameLogic.gameOver();

}


function drawKillLine() {

    var img = resService.getBitmap( C.img.killLine );

    img.setBounds (0,0, 600, 10);
    img.x = -20;
    img.y = SHOOT_Y - 80;
    img.name = C.img.killLine;

    img.scaleX = WIDTH / img.width + 1 ;
    img.scaleY = 1.2;
    img.alpha = 0;
    img.visible = false;

    img.on( 'line', toggleVisible );
    img.on( 'gameover', toOver );

    line.img = img;

    stage.addChild( line.img );

}


function toggleVisible() {

    if( line.img ) {

        line.img.visible = !line.img.visible;

        if(line.img.visible) {
            c.Tween.get( line.img ).to( {alpha: 0.5}, 800 );
        } else {
            c.Tween.get( line.img ).to( {alpha: 0 }, 500 );
        }
    }

};


function drawPausedBtn() {

    var btnPaused = resService.getBitmap( C.img.buttonPause );
    btnPaused.x = WIDTH -100 ;
    btnPaused.y = HEIGHT -130;
    btnPaused.on( 'click', toPaused );

    stage.addChild( btnPaused );

}

// ---------------------------------------------------------------
// Shoot queue
var queue = {
    // 最高一次循环长度
    maxNum: C.map.maxShot,
    curLength : 0,
    curBubble : null,
    curBubbleType : -1,
    nextBubbleType : -1,
    numSameColorInAQueue : 0,
    container : {},
    init : function () {

        queue.drawArror();

        queue.bullet.getCurBubbel();

        queue.container =  new c.Container();
        queue.container.x = SHOOT_X - 80;
        queue.container.y = SHOOT_Y + 46;
        queue.curLength = queue.maxNum;
        queue.drawQueue( queue.curLength );

        stage.addChild( queue.container );

        queue.container.on( 'queue', queue.onUpdate );
    },

    bullet : {
        getCurBubbel: function() {

            // 获取类型
            this.randomShootColor();

            if( queue.curBubbleType ) return;

            queue.curBubble = new Bubbles( SHOOT_X, SHOOT_Y, null, null, queue.curBubbleType );

            if( queue.curBubble )
                stage.addChild( queue.curBubble );


        },
        doShootAnimate : function( event ) {

            if( event.rawY > SHOOT_Y || event.rawX > WIDTH || event.rawX < 1 || event.rawY < 1 ) return;

            event.bubbles = false;

            var shot_pos = { x: SHOOT_X,  y: SHOOT_Y }
                , mouse_pos = { x: event.rawX, y: event.rawY }
                , destroed;

            resService.radioSound( C.sound.shoot );

            bubblesMap.shoot( shot_pos, mouse_pos, queue.curBubble, queue.container );
        },
        randomShootColor : function() {

            if( -1 == queue.curBubbleType ) {
                queue.curBubbleType = bubblesMap.randomShootColor( -1 )
                , queue.nextBubbleType = bubblesMap.randomShootColor( -1 )
                , queue.numSameColorInAQueue = 0;
            } else {
                var bubbleCount = bubblesMap.getBubbleCount();
                // 预防生成一个未存在面板的球
                for( ; 0 == bubbleCount[ queue.nextBubbleType ]; ){
                    queue.nextBubbleType = bubblesMap.randomShootColor( -1 );
                }

                queue.curBubbleType = queue.nextBubbleType,
                queue.nextBubbleType = bubblesMap.randomShootColor( queue.curBubbleType, queue.numSameColorInAQueue )
                queue.nextBubbleType == queue.curBubbleType ? queue.numSameColorInAQueue++ : queue.numSameColorInAQueue = 0;
            }
        }

    },
    onUpdate : function( event ) {

        if( null == event.data ) return;

        if( gameLogic.currentState != gameLogic.state.play ) return;

        queue.bullet.getCurBubbel();

        var hasDestroied = event.data;

        if( !hasDestroied ) {

            queue.updateLength();
        }

        queue.drawQueue( queue.curLength );
    },
    drawQueue : function( len ) {

        var item
            , colorIndex
            , name;

        queue.container.removeAllChildren();
        for( var i = 0; i != len; i++ ) {

            colorIndex = ( i > 0 ) ?
                0 : ( queue.nextBubbleType );

            name = C.img.colors[ colorIndex ];

            item = queue.createItem( name, i );
            queue.container.addChild( item );
        }
    },
    createItem : function( name, index ) {

        if( null == index )
            return console.log(" error = ",index);

        var item;
        item = resService.getBitmap( name );
        item.x = 36 * index ;
        item.y = 0;
        item.scaleX = item.scaleY = 0.6;

        return item;

    },
    updateLength : function () {

        if( queue.curLength > 1 ) {
            --queue.curLength;
        } else {
            // 增加一行
            bubblesMap.insertNewRows();
            queue.curLength = queue.maxNum = ( queue.maxNum > 1 ) ? (--queue.maxNum) : 5;
        }

    },
    drawArror : function () {
        var arrow = resService.getBitmap( C.img.shootingArm );

        arrow.x = SHOOT_X;
        arrow.y = SHOOT_Y;
        arrow.regX = arrow.width >> 1;
        arrow.regY = arrow.height;
        arrow.scaleX = arrow.scaleY = 0.6;

        stage.addEventListener('stagemousemove', faceMousePointer);

        function faceMousePointer( event ) {

            var mouse_pos = { x: stage.mouseX, y: stage.mouseY }
                , angle = Math.atan2( ( mouse_pos.x - arrow.x ), ( arrow.y - mouse_pos.y ) )*(180/Math.PI);

            if( angle > -90 && angle < 90 ) {
                arrow.rotation = angle;
            }

        }

        stage.addChild( arrow );
    }


};



//Prepare the bubble map
function prepareWorld() {

    // TODO: Will resiaze the windows

    SHOOT_X = WIDTH >> 1 ;
    SHOOT_Y = HEIGHT - 200;

    gameLogic.currentState = gameLogic.state.play;

    // Listener
    stage.addEventListener( 'stagemousedown', queue.bullet.doShootAnimate );

    // Killing line
    line.draw();

    // 初始地图
    bubblesMap = new BubblesMap( line.img, stage.canvas.width );

    stage.addChild( bubblesMap );

    // Waiting queue
    queue.init();

    // Paused
    drawPausedBtn();

    // Digit area
    hud.init( 25, 430 );
    stage.addChild( hud.get() );

    // sound start
    resService.radioSound( C.sound.start );
}


// The enter
domReady( init );

function init() {
    stage = new c.Stage( 'canvas' );

    WIDTH = stage.canvas.width;
    HEIGHT = stage.canvas.height;

    // Loading resource
    // resService.init( prepareWorld );
    resService.init( gameLogic.main );

    // stage
    c.Ticker.setFPS( 60 );
    c.Ticker.addEventListener('tick', stage);
}
