'use strict';

var domReady = require('./util').domReady
    , resService = require('./resource')
    , Bubbles = require('./Bubbles');

var c = createjs
    , stage
    , manifest
    , preloader; 

domReady(function init() {

    stage = new c.Stage( 'canvas' );

    // // Method Load the reouce 1
    // manifest = [
    //     {src: 'res/sprites_1.png', id: 'sprites_1'},
    //     {src: 'res/sprites_0.png', id: 'sprites_0'}
    // ];
    // startPreload();
    

    // Method Load the reouce 2
    resService.init();


    
    setTimeout(function(){
        if( resService.isComplete ) {
            var bitmap = resService.getBitmap("bubble1");
            if(null == bitmap ) {
                console.log('resService.isComplete bitmap is null');
            } else {
                bitmap.x = bitmap.y = 8;
                stage.addChild(bitmap);
            }            
        }
    }, 200);
    c.Ticker.setFPS( 60 );
    c.Ticker.addEventListener('tick', function() {
        stage.update();
    });
    
});

function test() {
    console.log("I am in main");
}
//Loading needed assets
function startPreload() {
    preloader = new c.LoadQueue(true);

    preloader.on('complete', prepareWorld);
    preloader.loadManifest(manifest);
}

//Prepare the bubble map
function prepareWorld() {
    
    for( var ix = 0; ix < 11; ix++ ) {

        for( var iy = 0; iy < 5; iy++ ) {

            var bubbles = new Bubbles(ix, iy);

            stage.addChild(bubbles);
        }
        
    }

}




