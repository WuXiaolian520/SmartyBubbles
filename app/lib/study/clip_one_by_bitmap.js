var img, stage;
function init() {
    //wait for the image to load
    img = new Image();
    img.onload = handleImageLoad;
    img.src = "./res/sprites_0.png";
}

function handleImageLoad(evt) {
    // create a new stage and point it at our canvas:
    stage = new createjs.Stage("canvas");

    // create a new Bitmap, and slice out one image from the sprite sheet:
    var bmp = new createjs.Bitmap(evt.target).set({x:200, y:200});
    bmp.sourceRect = new createjs.Rectangle(916, 101, 84, 84); //x,y,width,height
    
    stage.addChild(bmp);

    stage.update();
}