//

var domReady = require('./util').domReady
    , c = createjs
    , canvas
    , stage
    , manifest
    , preloader
    , cont;

domReady( init );

function main() {
    canvas = document.getElementById('canvas');
    stage = new c.SpriteStage(canvas);

    //asset
    manifest = [
        {src: 'res/sprites_1.png', id: 'sprites_1'},
        {src: 'res/sprites_0.png', id: 'sprites_0'},
        {src:'res/spritesheet_font.png', id:'font'}
    ];

    startPreload();
}

//Loading needed assets
function startPreload() {
    preloader = new c.LoadQueue(true);

    preloader.on('complete', showStartMenu);
    preloader.loadManifest(manifest);
}


// Prepare the start menu
function showStartMenu() {
    //Method 1
    var sprites_0 = {
        "images": [preloader.getResult('sprites_0')],        
        "animations": {
            "button_audio": {"frames": [0]},
            "button_back": {"frames": [1]}
        },

        "frames": [
        // x, y, width, height, imageIndex*, regX*, regY*
            [916, 101, 84, 84, 0, 0, 0],
            [806, 201, 119, 120, 0, 0, 0]
        ]
    };

    var spriteslist = new c.SpriteSheet(sprites_0);
    var btn_audio = new c.Sprite(spriteslist);

    btn_audio.x = btn_audio.y = 20;
    stage.addChild(btn_audio);
    btn_audio.gotoAndStop('btn_audio');

    stage.update();

}