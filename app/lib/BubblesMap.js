
/*
 * BubblesMap class
 * 
 */

'use strict';

var createSubClass = require('./util').createSubclass
    , QueneEnginer = require('./util').queneEnginer
    , print = require('./util').print
    , resService = require('./resource')
    , Bubbles = require('./Bubbles')
    , levels = require('./levels')
    , C = require('./config')
    , hubService = require('./hud')
    , Container = createjs.Container;

// TODO :要把配置参数放在一起
// 初始时候的总的列数
var _bubbleRadius = 0
    , _bubbleDiameter = 0
    , currentLevel = 0
    , total_added_rows = 0
    , add_rows_num = 0
    , update_compelete = true
    , _WIDTH;


module.exports = createSubClass( Container, 'BubblesMap', {
    initialize: BubblesMap$initialize,
    placeMap: BubbleMap$placeMap,
    placeRow: BubbleMap$placeRow,
    placeBubble: BubbleMap$placeBubble,
    shoot: BubblesMap$shoot,
    getBubble: BubblesMap$getBubble,
    addBubble: BubblesMap$addBubble,
    deleteBubble: BubblesMap$deleteBubble,
    insertNewRows: BubblesMap$insertNewRows,
    randomShootColor : BubblesMap$chooseRandomShootColor,
    setLevel : BubblesMap$setLevel,
    getBubbleCount: BubblesMap$bubbleCount
} );


function BubblesMap$bubbleCount() {
    return this._bubbleCount;
}


/*
 * 初始地图
 */
function BubblesMap$initialize( listner, width, level ) {
    
    Container.prototype.initialize.apply(this, arguments);

    this.x = this.y = 0;

    if( null == level ) level = 0;
    this.setLevel( level );

    this.placeMap();

    this.listner = listner;    
    
    this.destroyQueue = new QueneEnginer();

    _WIDTH = width;

    // 监听面板上球类型变化
    this.on( 'bubbleType', handleType );

    this.on( 'message', handleMessage );

    console.log('initialize end');
}


function BubblesMap$setLevel( curLevel ) {

    if( null == curLevel || 'number' != typeof(curLevel) ) 
        return print.error( C.error.no_param , 'at: BubblesMap$setLevel' );

    this.curLevel = curLevel;

    this.setLevel = C.level[ this.curLevel ];
    var l = C.level[ this.curLevel ];
    
    // 整个地图的总行数
    this._max_rows = C.map.maxRows;    
    // 记录起始行数
    this._start_rows = l.start_rows;   
    // 地图有球行数                       
    this._exsit_bubs_minIndex = (this._max_rows - this._start_rows);    
    // 列数
    this._numCols = l.cols_num;
    // 行数
    this._numRows = C.map.maxRows;

    this._freeRows = 0;   
     
    // 可使用球的颜色
    this._availableColors = l.colors;
    // 计算每种颜色的球数
    this._bubbleCount = [];
    for ( var t = 0, i = this._availableColors.length; t != i; t++ ) {

        var e = this._availableColors[ t ];
        this._bubbleCount[ e ] = 0;       
    }

    // 直径
    this._bubbleDiameter = 54;
    // 半径
    this._bubbleRadius = 0.5 * this._bubbleDiameter;


    _bubbleRadius = this._bubbleRadius;
    _bubbleDiameter = this._bubbleDiameter;

    // 当前存在的球类型总数
    this._numBubbleTypesOnBoard = 0;
    // 一次增加的行数
    this._numRowsToInsert = 0;
}


function BubbleMap$placeMap(){

    var fromRowNum = this._exsit_bubs_minIndex
        , toRowNum = this._max_rows;

    if( fromRowNum < toRowNum ) {

        // 所有球按照row, col的位置存储
        this._bubbles = [];

        for( var i = fromRowNum; i != toRowNum ;) {
            var n = i++;
            this.placeRow( n );
        }

        print.log( this._bubbles );
    } else {
        print.error( C.error.error_setting );
    }
    
}


function BubbleMap$placeRow( rowIndex ){

    var bubble;

    this._bubbles[ rowIndex ] = [];

    for( var i = 0; i != this._numCols; ) {

        var colIndex = i++;

        var rcPosition = { row: rowIndex, col: colIndex };

        this.placeBubble( rcPosition );

    }
    
}


function BubbleMap$placeBubble( rcPosition ){

    if( hasNullParam( rcPosition ) ) 
        return print.error( C.error.no_param, 'at : BubbleMap$placeRow' );

    var bubble
        , pos
        , color;

    pos = calcBubblePos( rcPosition );
    color = chooseRandomBoardColor.call( this, 1);
   
    bubble = new Bubbles( pos.x , pos.y , rcPosition.row, rcPosition.col, color );         

    this._bubbles[ rcPosition.row ][ rcPosition.col ] = bubble;

    this.addChild( bubble );

    this._bubbleCount[ color ] ++
    , 1 == this._bubbleCount[ color ] && ( this._numBubbleTypesOnBoard++, updateRowsToInsert.call( this ));

    setNeighbor.call( this, rcPosition , {
        'left': 'right', 'downleft' : 'upright', 'downright' :'upleft',
        'right': false, 'upleft': false, 'upright': false
    } ); 
    
}


function hasNullParam( param ) {

    if( null == param ) {

        return true;
    } else {

        for( var item in param ) {

            if( param.hasOwnProperty( item ) && null == param[ item ] )
                return true;
        }

        return false;        
    }

}

/*
 * 设置球的所有方向的邻居属性
 * @param {Object} rcPosition 所在行数列数
 * 
 */

function setNeighbor( rcPosition, opposite ) {

    if( hasNullParam( rcPosition ) )
        return print.error( C.error.no_param, 'at: setNeighbor' );

    var neb_pos
        , cur_bubble
        , opp_bubble;

    // 设置邻居
    ( null == opposite ) ? opposite = {
        'upleft': 'downright', 'upright': 'downleft', 'left': 'right',
        'right': 'left', 'downleft': 'upright', 'downright': 'upleft'
    } : opposite ;

    for( var dis in opposite) {
        
        // 获取方向上的行列值
        neb_pos = getNebRowCol.call( this, dis, rcPosition );

        // 当前行列上的球
        cur_bubble = this.getBubble( rcPosition );

        if( !cur_bubble ) return print.error( C.error.no_param, 'at: setNeighbor' );

        if( neb_pos.col < 0 || neb_pos.col > (this._numCols-1) ) {
            // 画布左右边界球
            cur_bubble.setNeighbors( dis, 0 );
        } else if ( neb_pos.row < this._exsit_bubs_minIndex ) {
            // 最下
            continue;
        } else if ( neb_pos.row > this._max_rows -1 ) {
            // 最上一排球
            cur_bubble.setNeighbors( dis, 0 );
        } else {
            // 对面方向没有邻居
            if( opposite[ dis ] ) {

                opp_bubble = this.getBubble( neb_pos );

                if( opp_bubble ) {
                    cur_bubble.setNeighbors( dis, opp_bubble );
                    opp_bubble.setNeighbors( opposite[ dis ], cur_bubble );                     
                }
            }
        }                   
    }
}


// 获得一个球一个方向的邻居的地址
function getNebRowCol( direction , rcPosition ) {

    if( hasNullParam( rcPosition ) ) 
        return print.error( C.error.no_param, 'at: getNebRowCol' );

    var r = rcPosition.row
        , c = rcPosition.col;

    var neighbor = {
        'left': { row: r, col: c-1 },
        'downleft' : { row: r-1, col: ( isEven(r) ) ? (c-1) : (c) },
        'downright' :{ row: r-1, col: ( isEven(r) ) ? (c) : (c+1) },
        'right': { row: r, col: c+1 },
        'upleft': { row: r+1, col: ( isEven(r) ) ? (c-1) : (c) },
        'upright': { row: r+1, col: ( isEven(r) ) ? (c) : (c+1) }
    }; 

    return neighbor[ direction ];
}

// 通过行数和列数获取xy地址
// rcPosition : row and col index
function calcBubblePos( rcPosition ) {

    if( hasNullParam( rcPosition ) ) 
        return print.error( C.error.no_param, 'at: calcBubblePos' );

    var bubX = 0
        , bubY = 0;

    bubX = ( isEven( rcPosition.row ) ? _bubbleRadius : _bubbleDiameter) + rcPosition.col * _bubbleDiameter;

    bubY = ( C.map.maxRows - rcPosition.row - 1 ) * _bubbleDiameter + _bubbleRadius;

    return { x : bubX, y : bubY };
}


function isEven( r ) {

    var res = ( r % 2 ) ? false : true;

    res = ( total_added_rows % 2 ) ? (!res) : res;

    return res;

}


function chooseRandomBoardColor( t ) {

    if (t) return this._availableColors[Math.floor(Math.random() * this._availableColors.length)];

    t = [];

    for (var e = 0, i = this._availableColors.length; i != e;) {

        var s = e++;

        0 < this._bubbleCount[this._availableColors[s]] && t.push(this._availableColors[s])

    }

    return 1 == t.length ? t[0] : t[Math.floor(Math.random() * t.length)];

}

// this._bubbleCount是按照颜色值为小标记录每个颜色值的数量
// this.__availableColors所有可用颜色库
// var count  = [null,1,2,3,0,0,1];
// var colors = [1,2,3,4,5,6];
// t = this._nextBubbleType, e = this._numSameColorsInARow

function BubblesMap$chooseRandomShootColor( t, e ) {

    null == e && (e = 0);

    for (var i = [], s = 0, n = this._availableColors.length; n > s;) {
        var a = s++;
        0 < this._bubbleCount[this._availableColors[a]] && i.push(this._availableColors[a])
    }

    if (1 == i.length) return i[0];
    s = -1;

    do s = i[Math.floor(Math.random() * i.length)], -1 != t && t == s && e >= C.map.MAX_SAME_COLORS_IN_A_ROW && null;
    while (-1 != t && t == s && e >= C.map.MAX_SAME_COLORS_IN_A_ROW);

    return s
}



function BubblesMap$getBubble( rcPosition ) {

    if( hasNullParam( rcPosition ) )
        return print.error( C.error.no_param, 'at: BubblesMap$getBubble' )
    
    return this._bubbles[ rcPosition.row ][ rcPosition.col ];
}


function BubblesMap$addBubble( rcPosition ) {

    // Check
    if( hasNullParam( rcPosition ) )
        return print.error( C.error.no_param, 'at: BubblesMap$addBubble' );
    
    if( !this._bubbles[ rcPosition.row ] ) {
        this._bubbles[ rcPosition.row ] = [];
    }

    this._bubbles[ rcPosition.row ][ rcPosition.col ] = this._currentBubble;    
}


function BubblesMap$deleteBubble( rcPosition ) {
    // Check
    if( hasNullParam( rcPosition ) )
        return print.error( C.error.no_param, 'at: BubblesMap$getBubble' );
    
    return delete this._bubbles[ rcPosition.row ][ rcPosition.col ];
}

// 处理数据
function handleMessage( event ) {

    if( !event.data ) return null;

    var type = event.data.msg
        , colorIndex = event.data.colorIndex;

    switch( type ) {
        case 0 :
            this._bubbleCount[ colorIndex ]++
            , 1 == this._bubbleCount[ colorIndex ] && ( this._numBubbleTypesOnBoard++, updateRowsToInsert.call( this ));
            break;
        case 1 :
            this._bubbleCount[ colorIndex ]--
            , 0 == this._bubbleCount[ colorIndex ] && ( this._numBubbleTypesOnBoard--, updateRowsToInsert.call( this ));
            break;
        default:
            throw "" + type;
    }

}

function handleType( event ) {

    if( !event.data ) return null;

    // 增加类型
    if( 1 == event.data) {
        BubbleMap._numBubbleTypesOnBoard ++;
        updateRowsToInsert.call( this );
    }
    // 减少类型
    else if( 2 == event.data ){
        BubbleMap._numBubbleTypesOnBoard --;
        updateRowsToInsert.call( this );
    }
}


function updateRowsToInsert() {

    this._numRowsToInsert = 1 + this._availableColors.length - this._numBubbleTypesOnBoard;
}


function updateMinRow() {

    if( !this._bubbles ) return console.log('updateMinRow error');

    var curArray
        , item
        , count
        , res = this._bubbles.length;

    for( var i = this._bubbles.length-1; i != -1; i-- ) {

        curArray = this._bubbles[i];

        if( !curArray ) continue;

        count = 0;
        for( var j in curArray ) {
            if( curArray[j] )   count++;
        }

        if( count ) {
            res = ( res > i ) ? i : res;            
        } else {
            delete this._bubbles[i];       
        }

    }

    this._exsit_bubs_minIndex = res;

    onKillLine.call( this );
}


// // 增加num行
// function BubblesMap$insertNewRows() {

//     update_compelete = false;

//     // Move postion
//     // update neibour
//     // 
//     // 现有的球向下移动num行
//     var bubble
//         , new_bubbles = []
//         , index
//         , y
//         , r;

//     resService.radioSound( C.sound.new_row ); 

//     for( var i = 1, len = this._bubbles.length; i != len; i++ ) {

//         if( this._bubbles[i] ) {

//             if( !this._bubbles.length ) return;

//             index = i - num;
//             new_bubbles[ index ] = [];

//             for( var j in this._bubbles[i] ) {

//                 bubble = this._bubbles[i][j];

//                 if( bubble ) {               
//                     bubble.doMoveDown( num );
//                     new_bubbles[ index ][ j ] = bubble;                    
//                 }

//             }                
//         }

//     }

//     this._bubbles = new_bubbles;

//     // 绘制现在num行 
//     var that = this;

//     setTimeout( function() { 

//         for(var i = num; i > 0; i-- ) {
//             if( that._max_rows-i > 0 ) {
//                 drawRow.call( that, that._max_rows-i );
//             }
//         } 
//         updateMinRow.call( that );    
//         update_compelete = true;      
//     }, 200 * num );

// }

function updateRowsToInsert() {
    this._numRowsToInsert = 1 + this._availableColors.length - this._numBubbleTypesOnBoard
}


function BubblesMap$insertNewRows() {

    for (var t = 0, e = this._numRowsToInsert; e > t;) {

        t++;
        // l冷冻所有的球
        for (var i = 0, s = this._bubbles[this._numRows - 1]; i < s.length;) {
            var n = s[i];
            ++i, n.enabled && n.disable()
        }

        // 移动数据
        for (i = this._bubbles[this._numRows - 1], s = this._numRows - 1; s > 1;) 
            this._bubbles[s] = this._bubbles[s - 1], 
            this._rowIndentation[s] = this._rowIndentation[s - 1], 
            s--;

        // 更新参数
        for (
            this._bubbles[1] = i, 
            this._rowIndentation[0] = this._rowIndentation[2], 
            this._rowIndentation[1] = 1 == this._rowIndentation[2] ? !1 : !0, 
            this.placeBubbleRow(1, !1), this.updateAllPositions(), 
            this.updateAllNeighbors(), 
            i = this._bubbles[this._numRows - 1], 
            s = 0; s < i.length;)
                if (n = i[s], ++s, n.enabled) return void this.setLevelFailed()

    }
}


function updateAllBubbles() {
            for (var t = 0, e = this._numRowsToInsert; e > t;) {
                t++;
                for (var i = 0, s = this._bubbles[this._numRows - 1]; i < s.length;) {
                    var n = s[i];
                    ++i, n.enabled && n.disable()
                }
                for (i = this._bubbles[this._numRows - 1], s = this._numRows - 1; s > 1;) this._bubbles[s] = this._bubbles[s - 1], this._rowIndentation[s] = this._rowIndentation[s - 1], s--;
                for (this._bubbles[1] = i, this._rowIndentation[0] = this._rowIndentation[2], this._rowIndentation[1] = 1 == this._rowIndentation[2] ? !1 : !0, this.placeBubbleRow(1, !1), this.updateAllPositions(), this.updateAllNeighbors(), i = this._bubbles[this._numRows - 1], s = 0; s < i.length;)
                    if (n = i[s], ++s, n.enabled) return void this.setLevelFailed()
            }
            y.dispatch(14)
}

function onKillLine() {

    var lineEvent;

    if( 0 >= this._exsit_bubs_minIndex ) {
        
        resService.radioSound( C.sound.game_over_failure );
        console.log('========比赛结束=======');
        lineEvent = new createjs.Event( 'gameover' );  
        this.listner.dispatchEvent( lineEvent ); 

    } else if( this._exsit_bubs_minIndex < 2 && !this.listner.visible ) {

        lineEvent = new createjs.Event( 'line' );
        this.listner.dispatchEvent( lineEvent );
        
    } else if( this._exsit_bubs_minIndex > 3 && this.listner.visible ) {

        lineEvent = new createjs.Event( 'line' );
        this.listner.dispatchEvent( lineEvent );
    }

    
}


/*
 * 发射后，找到最近位置，并且添加
 * @param {Int} r 所在行数
 * @param {Int} c 所在列数
 */

function BubblesMap$shoot( shoot_pos, click_pos, bubble, obj ) {   

    var empty_pos
        , target
        , equation
        ;

    if( !update_compelete ) return console.warn(' ERROR: at BubblesMap$shoot ==> 球列表，还没有更新好');

    // 派发开始发球事件
    hubService.dispatchEvent({
        type: 'record',
        data: true
    });

    // 获取目标球
    this._currentBubble = bubble;
    this.addChild( bubble );    

    this.dispatchEvent({
        type: 'message',
        data : {
            msg: 0,
            colorIndex : bubble.type                
        }
    }); 

    // 重置访问权，并且获得下次能发射的点
    empty_pos = resetParams.call( this );
    
    if( !empty_pos ) return console.warn(' ERROR ');

    // 计算发射点和点击点的直线方程
    equation = getEquation( shoot_pos, click_pos );

    // 计算最佳位置
    target = calcTargetPos.call( this, equation, empty_pos );

    if( !target ) return null;
    // 保存当前球的地址和类型
    this._curBubPosition = target.rc;

    // this.placeBubble( this._curBubPosition, this._currentBubble );

    // 添加到球的数组
    // this.updateBubList( U.ADD, target.rc );
    this.addBubble( target.rc );

    // 获取移动的点和方向
    moveBubble.call( this, target , obj );
}



function resetVisit() {
    
    this._bubbles.forEach( function( row ) {

        row.forEach( function( bub ) {
            if( bub ) {
                bub._visit = false;              
            }
        });
    });

}


// 重置访问权，并且获得下次能发射的点
function resetParams() {

    var border_bub = [];
    
    var that = this;
    this._bubbles.forEach( function( _row, rowIndex ) {

        if( _row.length ) {

            _row.forEach( function( bub ) {

                if( bub ) {

                    bub._visit = false;
                    if( !bub.getFullRing() ) {

                        var res = bub.getRowCol();
                        if( res.row ) {
                           border_bub.push( bub.getRowCol() ); 
                        } else {
                            return null;
                        }
                        
                    }                
                }
            });            
        }

    });

    // 边界球
    // console.log('边界球的数组：border_bub = ', border_bub );
    // 返回空位置
    return getShootPoints.call( this, border_bub );
  
}


// 计算 point1 和 point2 的直线方程
function getEquation ( point1, point2 ) {

    if( !point1 || !point2 ) return;

    return {
        a: point1.y - point2.y,
        b: point2.x - point1.x,
        c: point1.x * point2.y - point2.x * point1.y
    };
}


function inArray( array, value) {

    var res = false;
    array.forEach( function ( item, index ) {
        if( JSON.stringify( item ) === JSON.stringify( value ) )  res = true;
    });

    return res;
}

// 获取所有可以发射的点
function getShootPoints( border_bub ) {

    if( !border_bub ) return;

    var bubble
        , map = this
        , dis
        , rcPosition
        , empty_pos = [];

    border_bub.forEach( function( pos ) {
        // console.log('边界球的地址：', pos );
        bubble = map.getBubble( pos );

        if( !bubble ) 
            return console.warn( 'ERROR: at BubblesMap getShootPoints: 边界球未获取到 位置pos = ', pos );

        for( dis in bubble.neighbor ) {

            // 获取边界球上的空位
            if( null == bubble.neighbor[ dis ] ) {
                
                // 获取该方向上的RC地址
                rcPosition = getNebRowCol( dis, pos );
                
                // 判断是否存在
                if( empty_pos.length > 0 ) {
                    
                    if( !inArray( empty_pos, rcPosition ) ) {
                        empty_pos.push( rcPosition );
                    }

                } else {
                    empty_pos.push( rcPosition );
                }
                
            }
        }
    });

    return empty_pos;
}

// 计算最佳位置
function calcTargetPos( equation , empty_pos ) {

    if( !equation || !empty_pos ) return console.warn( 'in calcTargetPos : no param ');

    // 直线发射
    var closer = getClosetPoint.call( this, equation, empty_pos );

    // 折线发射
    var crash = []
        , crash_x
        , crash_y
        , last = equation   // 上一次方程
        , current;          // 折线方程

    while( null == closer ){
        // 判断碰撞时X的值
        crash_x = ( last.b < 0 ) ? _bubbleRadius : ( _WIDTH - _bubbleRadius );
        // 生成碰撞点
        crash_y = (last.c + last.a * crash_x ) / ( - last.b );

        crash.push( {x: crash_x, y: crash_y} );

        // 生成折射线
        current = {
            a: last.a,
            b: - last.b,
            c: - last.c - ( 2 * last.a * crash_x )
        };

        last = current;

        closer = getClosetPoint.call( this, current, empty_pos );    
 
    };

    // 添加最后位置
    crash.push( calcBubblePos( closer ) );

    return {
        rc: closer,
        crash: crash
    };
}

// 计算离直线距离最近的点
function getClosetPoint( equation , points ) {

    if( !equation || !points ) return console.warn('error: in getClosetPoint no param ');

    var position
        , point
        , list = []
        , distance
        , closer = null;

    for( var i = 0, len = points.length; i != len; i++ ) {

        point = points[i];

        position = calcBubblePos( point );
        
        // 计算点到直线距离
        distance = calcDistance( equation, position ) ;
        
        // 保存近距离的点
        if( Math.abs( distance ) < _bubbleDiameter ) {
            // 排序插入
            list.push({
                rc: point,
                dis: distance
            });                
        }
    }

    // 给数组排序
    list = list.sort( function( a, b) {
        return Math.abs(a.dis) - Math.abs(b.dis);
    });


    if( list.length ) {
        // 安装顺序来判断是否合格
        for( var j = 0, l = list.length; l != len; j++ ) {

            if( !list[j].rc ) {
                console.log('没有参数：', list[j] );
                return;
            }

            if( isValidate.call( this, list[j].rc ) ) {
                return list[j].rc;
            } 
                
        }        
    } else {
        return null;
    }

    // 判断点是否合格：
    // 1：遍历所有存在的球是否存在阻碍
    // 2：y<目标点
    function isValidate( point ) {

        var point_xy = calcBubblePos( point )
            , distance
            , position
            , bubble
            , res = true;

        for( var i = 0, len = this._bubbles.length; i != len; i++ ) {

            for( var j in this._bubbles[i] ) {

                bubble = this._bubbles[i][j];

                if( bubble && point_xy.y <= bubble.y ) {
                    // 判断点到直线的距离
                    distance = calcDistance( equation, bubble.getPos() );

                    if( Math.abs( distance ) < _bubbleRadius ){
                        res = false; break;
                    }
                }
            }
        }

        return res;
    };
}


// 计算点到直线的距离
function calcDistance ( equation, pos ) {

    var a = equation.a
        , b = equation.b
        , c = equation.c
        , dis = 0 ;

    dis = (a*pos.x + b*pos.y + c) / Math.pow( (a*a + b*b), 1/2 );

    return dis;
}


function moveBubble( target , obj ) {

    if( null == target ) return console.warn('in moveBubble : no param');

    var crash_num
        , tween
        , crash
        ;

    // 移动球的情况
    crash_num = target.crash.length;

    tween = createjs.Tween.get( this._currentBubble );
    // TODO: 优化速度，应该安装距离除以速度得到时间的优化方向
    if( crash_num ) {

        crash = target.crash;        
        for( var i = 0, len = crash_num; len != i; i++ ) {

            if( i == len -1 ) {
                var xy = {
                    x: crash[ i ].x,
                    y: crash[ i ].y
                }

                tween.to( { x: crash[ i ].x, y: (crash[ i ].y ) }, 250, createjs.Ease.linear)
                    .call( handleComplete , [ xy, target.rc ], this ); 

            } else {
                tween.to( { x: crash[ i ].x, y: crash[ i ].y }, 250, createjs.Ease.linear)
                    .call( function() {
                        resService.radioSound( C.sound.bounce );
                    }); 
               
            }
            
        }
    }

    // 移动结束：更新球类位置，邻居等
    function handleComplete( xy, rc ) {

        // Set target postion.
        this._currentBubble.setPos( xy.x, xy.y );
        this._currentBubble.setRowCol( rc.row, rc.col );

        setNeighbor.call( this, rc );

        var o, that = this;

        this.canDestroyList = [];
        // this.beDestroied = [];

        this._currentBubble._connected = false;
        this.canDestroyList.push( rc );

        var distroied;
        // 计算连接的可消球
        calcLinkBubs.call( this, target.rc ); 

        // console.log('canDestroyList', this.canDestroyList );
        // 同类球大于等于三个
        if( this.canDestroyList.length > 2 ){
        
            distroied = true;
            calcAllDestroyBubs.call( this );
            this.destroyQueue.start();
            resService.radioSound( C.sound.burst, this.canDestroyList.length );

        } else {

            resService.radioSound( C.sound.tap );
            distroied = false;
            this.canDestroyList.forEach( function ( item ) {
                o = that.getBubble( item );
                o._connected = true;
            });
        }


        // Event
        var myevent = new createjs.Event('queue');
        myevent.data = distroied;
        obj.dispatchEvent( myevent ); 

        setTimeout( function() {
            hubService.dispatchEvent({
                type: 'statistics',
                data: true
            });            
        }, 1000 );
    }


}


// 需要再优化：应该按照发射的角度进行跳动
function collisionEvent() {

    var dis = 0
        , bubble
        , that = this;

    this._bubbles.forEach( function( _row ) {
        _row.forEach( function( cell, index ) {
            if(!cell) return;
            dis = calcDisBetweenTarget.call( that, that._curBubPosition, {row: cell.row, col: cell.col} );
            if( dis > 0 && dis < 3 ) {
                cell.doCollision( index );
            }
        })
    });
}


// 遍历邻居，返回相同类型的球的地址
function calcLinkBubs( rcPosition ) {

    var o = this.getBubble( rcPosition )
        , next_o
        , next;

    if ( !o || o._visit ) {
        return;
    }

    o._visit = true; 

    for( var dir in o.neighbor ) {

        next = o.neighbor[dir];
        if( next ) {
            
            next_o = this.getBubble( next.pos );

            if( !next_o ) return;
            if( !inArray( this.canDestroyList, next.pos ) &&  next.type == this._currentBubble.type ) {

                // console.log( '=====> 1:查询可消除列表有：bubble pos = ', next.pos );
                // console.log( '=====> 1:可消除的球类型是：bubble type = ', next.type );
                this.canDestroyList.push( next.pos );
                next_o._connected = false;
                calcLinkBubs.call( this, next.pos );
            } 

        }
    }
}


// 只针对已经选中的列表
function calcAllDestroyBubs() {

    var that = this
        , destroied;

    // console.log('=====> 进入消除可消球的列表中 。');
    this.canDestroyList.forEach( function ( item , index ) {
        
        if( item ) {

            // console.log('in foreach item = ', item );

            that.destroyQueue.add( destroyBubble, that, [ item, index ] );
            // 清除本球的相关邻居属性
            updateNeighbor.call( that, item );   
              
        }
        
    });


}

function destroyBubble( rcPosition, index ) {

    var bubble = this.getBubble( rcPosition );

    // 更新所有球的列表
    // this.updateBubList( U.DELETE, rcPosition );
    if( this.deleteBubble( rcPosition ) ) {
        // 代表星星消灭你
        var dis = calcDisBetweenTarget.call( this, this._curBubPosition, rcPosition );

        if( null == index ) {
            index = this.canDestroyList.indexOf( rcPosition );
        }

        this.dispatchEvent({
            type: 'message',
            data : {
                msg: 1,
                colorIndex : bubble.type                
            }
        });

        bubble.doDestroy( dis, index );       
    }


}


function calcDisBetweenTarget( a, b ) {
    return Math.abs( a.row - b.row ) + Math.abs( a.col - b.col );
}


function updateNeighbor( rcPosition ) {

    if( !rcPosition ) return console.warn('param error');
    
    var o = this.getBubble( rcPosition )
        , next_o
        , next
        , opp;

    var opposite = {
        'downright': 'upleft',
        'downleft': 'upright',          
        'upleft': 'downright',
        'upright': 'downleft', 
        'left': 'right',
        'right': 'left'
    };

    // console.log( '=====> 3:更新当前球的邻居们======  rcPosition =', rcPosition);

    for( var dir in o.neighbor ) {

        next = o.neighbor[dir];
        opp = opposite[dir];
        // console.log('=====> 3.1.1 : 循环查询里面的邻居, 方向是 ：', dir);
        if( next ) {          
            // console.log('=====> 3.1.2 : 循环查询里面的邻居, pos = ', next.pos );
            if( next.pos.row == rcPosition.row && next.pos.col == rcPosition.col ) {
                // console.warn('--------------------------------------->Big error: 邻居球的位置维护出错。');
                // console.warn('--> current pos = ', rcPosition, 'next dir = ', dir, 'next pos = ', next.pos );
                return;
            }

            next_o = this.getBubble( next.pos );

            if( next_o ){ //&& next_o._connected

                next_o.neighbor[ opp ] = null;

                // console.log( '=====> 3.2.3:更新当前球的邻居球的属性 ======  opp =', opp, ' neighbor = ',  next_o.neighbor );

                if( inArray( this.canDestroyList, next.pos ) ) {

                    // console.log('=====> 3.2.2 : 该球的邻居已经存在于等待消球的列表中。next.pos = ', next.pos);
                    continue; 
                }  

                if( isHangBubble.call( this, next.pos ) ) {

                    // console.log('=====> 3.2.4 : 存在悬挂球，位置是 pos = ', next.pos );
                    
                    next_o._connected = false;

                    this.canDestroyList.push( next.pos );

                    this.destroyQueue.add( destroyBubble, this, [ next.pos, null ] );

                    // 清除本球的相关邻居属性
                    updateNeighbor.call( this, next.pos );    
                }
            }
        }
    }
}


function isHangBubble( rcPosition ) {

    // 遍历该球能遍历到的最大row
    var o = this.getBubble( rcPosition )
        , max = rcPosition.row
        , top = this._max_rows - 1
        , neighbor;

    var that = this;
    resetVisit.call( this );

    function travelMap( rcPosition ) {
        
        var o = that.getBubble( rcPosition )
            , next;

        if ( !o || o._visit || !o._connected ) return;

        o._visit = true; 

        for( var dir in o.neighbor ) {

            next = o.neighbor[dir];

            if( next ) {
                if( next.pos.row > max ) {
                    max = next.pos.row;
                }

                travelMap( next.pos );
            }
        }
    };

    travelMap( rcPosition );

    if( top == max ) {
        return false;
    } else {
        return true;
    }
}

