
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
function BubblesMap$initialize( rows, cols ) {
    
    Container.prototype.initialize.apply(this, arguments);
    this.x = this.y = 0;
    // 初始的行和列
    this._start_rows = rows;    //记录起始行数
    this._start_cols = cols;    //记录起始列数
    this._col = cols-1;         //bub 的总列数
    this._row = rows-1;         //bub 的总行数
    this._all = [];             // 所以未消的球
    this._boundary = [];        // 边界球的列表

    drawTree.call( this );
}


/*
 * 绘制地图方法
 */
function drawTree() {
    var index = 0;

    // 绘制初始地图
    for( ; index < this._start_rows; index++ ){
        drawRow.call( this, index );
    }  

    //遍历所有地图，维护边界球的地址
    traverseNeighbor.call(this, 0, 0 );
}


/*
 * 绘制一行，并且设置邻居列表
 * @param {Int} r 所在行数
 * 
 */
function drawRow( r ) {

    if( r == null ) return;

    var bubble
        , col = 0
        , bubX
        , bubY
        , rang = parseInt(this._start_rows - r) 
        , name ;

    this._all[r] = [];

    bubX = ( r%2 ) ? 2*_radius : _radius;
    bubY = ( rang > 0 ) ?  rang*2*_radius: ( 2*_radius );

    do{
        bubble = new Bubbles( bubX, bubY , r, col );

        this.addChild(bubble);
        // 加入数组
        this._all[r].push( bubble );
        setAllPosition.call( this, r, col );

        bubX += 2*_radius;
        col++;
        
    } while( col < this._start_cols );

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
        'upright': { opp: false, row: r+1, col: (r%2 == 0) ? (c) : (c+1) },
    };

    for( var pos in oppositePos) {

        curPos = oppositePos[pos];
        cur = this._all[ r ][ c ];        

        if( curPos.col < 0 || curPos.col > this._col ) {

            cur.setNeighbors( pos, 0 );
        } else  if ( curPos.row < 0 ) {
            //低于当前行的行
            continue;
        } else  if ( curPos.row > this._row ) {
            // 高于当前最大的行
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
