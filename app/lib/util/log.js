
'use strict';

// module.exports = printEnginer;

// var printEnginer = {
    
var printEnginer = module.exports = {
    open : 1,
    error : function( local, msg ) {

        if( this.open ) {
            console.warn( '----------------> ERROR: get error at ////', local, '//// , message is ////', msg , '////');            
        }
    },
    log : function( msg ) {

        if( this.open )
            console.log( '--> LOG: message is ////', msg , '////' );
    },
    on : function() {

        this.open = !1;
    },
    off : function() {

        this.open = 0
    }
};