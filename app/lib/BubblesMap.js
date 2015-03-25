
/*
 * BubblesMap class
 * 1:能生成bubbles地图
 * 2:能通过container来奇偶交错的效果
 * 3:生成器能在初始的时候生成整片babbles
 * 4:能添加一个babbles
 * 5:能设置球的邻居球，更新邻居球
 */

'use strict';

var createSubClass = require('./util').createSubclass
    , Bubbles = require('./Bubbles')
    , Container = createjs.Container;

// TODO :要把配置参数放在一起
// 初始时候的总的列数
var _radius = 27;


module.exports = createSubClass(Container, 'BubblesMap', {
    initialize: BubblesMap$initialize,
    addOne: BubblesMap$addOne,
    test : BubblesMap$test
});


/*
 * 球的初始地图
 * @param {Int} rows 地图的起始行数
 * @param {Int} cols 地图的起始列数
 */
function BubblesMap$initialize( total, rows, cols ) {
    
    Container.prototype.initialize.apply(this, arguments);
    this.x = this.y = 0;
    // 初始的行和列
    this._total_rows = total;   // 整个地图的总行数
    this._start_rows = rows;    // 记录起始行数
    this._start_cols = cols;    // 记录起始列数
    this._cols = cols;         // 地图有球列数
    this._rows = rows;         // 地图有球行数
    this._all = [];             // 所以未消的球
    this._boundary = [];        // 边界球的列表

    drawTree.call( this );
}


/*
 * 绘制地图方法
 */
function drawTree() {
    var r = this._total_rows - this._start_rows;

    if ( r < 0 ) {
        console.warn('行数的参数错误！');
        return;
    }

    // 绘制初始地图
    for( ; r < this._total_rows; r++ ){
        // 绘制一行
        drawRow.call( this, r );
    }  

    //遍历所有地图，维护边界球的地址
    traverseNeighbor.call( this, 8 , 1 );

    console.log( this._boundary );
}


/*
 * 绘制一行，并且设置邻居列表
 * @param {Int} r 所在行数
 * 
 */
function drawRow( r ) {

    if( r == null || r < 0 ) return;

    var bubble
        , col = 0
        , pos;

        this._all[r] = [];

    do{
        pos = getPosByRC.call( this, r, col );

        bubble = new Bubbles( pos.x , pos.y , r, col );

        this.addChild(bubble);
        // 加入数组
        this._all[r].push( bubble );
        setAllPosition.call( this, r, col );
        col++;
        
    } while( col < this._cols );

}


function getPosByRC( r, c ) {

    if( null == r ) return;

    var bubX = 0
        , bubY = 0
        , rang = parseInt( this._total_rows - r -1 );

    bubX = (( r%2 ) ? 2*_radius : _radius) + c*2*_radius;

    bubY = rang*2*_radius + _radius;
    // ( rang > 0 ) ?  rang*2*_radius: ( 2*_radius );

    return {
        x : bubX,
        y : bubY
    }
}


function getRCByPos() {

}
 
/*
 * 设置球的所有方向的邻居属性
 * @param {Int} r 所在行数
 * @param {Int} c 所在列数
 * 
 */
function setAllPosition( r, c ) {
    var oppositePos
        , curPos
        , cur
        , oppBub
        , dl_col
        , dr_col;

    oppositePos = {
        'left': { opp:'right', row: r, col: c-1 },
        'downleft' : { opp:'upright', row: r-1, col: (r%2 == 0) ? (c-1) : (c) },
        'downright' :{ opp:'upleft', row: r-1, col: (r%2 == 0) ? (c) : (c+1) },
        'right': { opp: false, row: r, col: c+1 },
        'upleft': { opp: false, row: r+1, col: (r%2 == 0) ? (c-1) : (c) },
        'upright': { opp: false, row: r+1, col: (r%2 == 0) ? (c) : (c+1) }
    };

    for( var pos in oppositePos) {
        
        curPos = oppositePos[pos];
        cur = this._all[ r ][ c ];        

        if( curPos.col < 0 || curPos.col > this._cols-1 ) {

            cur.setNeighbors( pos, 0 );
        }
         else  if ( curPos.row < this._total_rows - this._rows ) {

            continue;
        } 
        else  if ( curPos.row > this._total_rows -1 ) {

            cur.setNeighbors( pos, 0 );
        } else {

            if( curPos.opp ) {

                oppBub = this._all[ curPos.row ][ curPos.col ];
                cur.setNeighbors( pos, oppBub );
                oppBub.setNeighbors( curPos.opp, cur );                
            }

        }                   
    }
}

/*
 * 遍历邻居，查找所有边界球
 * @param {Int} r 所在行数
 * @param {Int} c 所在列数
 */
function traverseNeighbor( r, c ) {

    var o = this._all[ r ][ c ]
        , next_i
        , next_j
        , next;
    
    if ( !o || o._visit ) {
        return;
    } 

    // 判断当前球的邻居是否满员
    if ( !o.getFullRing() ) {
        this._boundary.push( o.getRowCol() );
    }   

    o._visit = true; 

    for( var dir in o.neighbor ) {

        next = o.neighbor[dir];
        if( next ) {
            next_i = next.row;
            next_j = next.col;
            traverseNeighbor.call( this, next_i, next_j );
        }
    }
}

// 维护边境球列表
// function maintainBoundary( bubble ) {

//     var pos = {
//         row: bubble.row,
//         col: bubble.col
//     }

//     var full_ring = bubble.getFullRing();

//     if( !full_ring ) {
        
//         this._boundary.push( pos );
//     }
// }

/*
 * 发射后，找到最近位置，并且添加
 * @param {Int} r 所在行数
 * @param {Int} c 所在列数
 */
function BubblesMap$addOne( x, y, bub ) {

}


function BubblesMap$test(r,c){
    var res = this._all[r][c].getNeighbors();

    for( var key in res ) {
        console.log( 'positon = ', key );
        console.log( 'value = ', res[key]);
    }

}
