/*
 * Resouce controller
 * 1:Preloade manifest
 * 2:Give the image or sounds
 */

'use strict';

var preloader
    , _manifest
    , _fileType
    , assetsPath
    , spriteSheet
    , img_array = []    // The images list array.
    , json_array = []   // The jsons list array.
    ;

var resourceService = module.exports = {
    init: res_init,
    getBitmap : getBitmap, //TODO: give up the function
    getResConfig : getResConfig,
    radioSound : radioSound,
    stopSound : stopSound,
    getFont : getFont
};


function res_init(func) {

    prepaerSetting();

    createjs.Sound.alternateExtensions = ["mp3"];
    // Loading power
    preloader = new createjs.LoadQueue( true, assetsPath );
    preloader.installPlugin( createjs.Sound );

    // Listener
    preloader.on("fileload", handleFileLoad);
    preloader.on("progress", handleProgress);
    preloader.on("error", handleError);
    preloader.on("complete", function() {
        console.log("...preloader is Complete...");
        func.call(this);
    }); 

    // Loading
    preloader.loadManifest( _manifest );   
}


function getFont( message ) {

    if( !message) return null;

    spriteSheet = new createjs.SpriteSheet( preloader.getResult('font') ); 
    
    var text = new createjs.BitmapText( message ,spriteSheet);
    return text;
}


function radioSound( target, loop ) {

    if( !loop ) loop = false;
    
    //Play the sound: play (src, interrupt, delay, offset, loop, volume, pan)
    var instance = createjs.Sound.play(target, createjs.Sound.INTERRUPT_NONE, 0, 0, loop, 1); 
    
    if (instance == null || instance.playState == createjs.Sound.PLAY_FAILED) {
        return;
    }     
    
    // instance.addEventListener("complete", function (instance) {
    //     console.log('声音 = ',target,'播放完成');
    // });

}


function stopSound() {
    createjs.Sound.stop();
}

// Prepare the congif data in resourceService
function prepaerSetting() {

    assetsPath = "./res/";

    // Set the source path map
    _manifest = [
        {src: 'sprites_0.png', id: 'img_0'},
        {src: 'sprites_1.png', id: 'img_1'},
        {src: 'spritesheet_font.png', id: 'img_font'},

        {src: 'sprites_0.json', id: 'json_0'},
        {src: 'sprites_1.json', id: 'json_1'},
        {src: 'spritesheet_font.json', id: 'font'},

        {src: 'sounds/ogg/bonus.ogg', id: 'bonus'},     // 奖金
        {src: 'sounds/ogg/burst.ogg', id: 'burst'},     // 爆发
        {src: 'sounds/ogg/start.ogg', id: 'start'},  
        {src: 'sounds/ogg/snap.ogg', id: 'snap'},       // 突然折断，拉断

        {src: 'sounds/ogg/bounce.ogg', id: 'bounce'},   // vt. 弹跳
        {src: 'sounds/ogg/tap.ogg', id: 'tap'},
        {src: 'sounds/ogg/shoot.ogg', id: 'shoot'},

        {src: 'sounds/ogg/game_over_failure.ogg', id: 'game_over_failure'},
        {src: 'sounds/ogg/game_over_success.ogg', id: 'game_over_success'},
        {src: 'sounds/ogg/new_row.ogg', id: 'new_row'}        
    ]; 

    // Set the file type name
    _fileType = {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
        IMAGE : createjs.AbstractLoader.IMAGE,
        JSON : createjs.AbstractLoader.JSON
    };

}


function handleProgress( event ) {

    // TODO: Loading progress 
    var div = document.getElementById('load');
    div.innerHTML = parseInt(event.progress*100) + '%';

}


// Handle when a file finsh loading.
function handleFileLoad( event ) {
    var item = event.item;

    // Group the files by type , saved in an array
    
    switch ( item.type ) {
        case _fileType.IMAGE:
            img_array.push(item.id);
            break;
        case _fileType.JSON:
            json_array.push( item.id );
            break;
    }
}


function handleError( event ) {

    // TODO: called when load error
    console.log(event);
    console.log("preloader error , src is = " + event.data.src);

}


/*
 * Get the bitmap , and a Bitmap represents an Image.
 * @param {String} name The name of image
 * @return {Bitmap} Returns the bitmap with pasting the image
 * TODO: Be deprecated
 */

function getBitmap( name ) {
    var res
        , frame;
    
    res = getResConfig( name );

    if( !res ) return null;

    var bitmap = new createjs.Bitmap( res.url );

    frame = res.frame;
    bitmap.sourceRect = new createjs.Rectangle( frame[0], frame[1], frame[2], frame[3] );
    bitmap.set( {width:frame[2], height: frame[3], scaleX: 1, scaleY: 1} );

    return bitmap;    
}

/*
 * Get the bitmap , and a Bitmap represents an Image.
 * @param {String} name The name of image
 * @return {Bitmap} Returns the bitmap with pasting the image
 */
function getResConfig( name ) {

    var json_res
        , res = {};

    if( null == name )
        return null;

    json_res = getJson( name );
    
    if( !json_res ) { return null; }

    res.frame = json_res.frame;
    res.url = preloader.getResult( json_res.image );
    return res;
}

/*
 * Traverse the array of JSON , find the name of json which have the resource.
 * All images and sound resource managed by JSON.
 * 遍历所有的JSON文件，查询拥有该资源名字的JSON文件。
 *
 * Example of the JSON form:
 * var json = {
 *    "images": ["path to resource"],
 *    "frames": [
 *        [2, 2, 512, 512]
 *    ],
 *   "animations": {
 *            "name":[0]
 *    }
 *}
 *
 * @param {String} name The name of resource, ex: image, sound(json.animations[name]).
 * @return {Object} Returns the name of json , the value (json.animations.name[0]) and the frame value.
 */
// function traverseJson ( name ) {
//     var json_data
//         , animations
//         , json_id
//         , key
//         , res = {};

//     if( null == name )
//         return null;

//     for( var i=0; i < json_array.length; i++ ) {
        
//         json_id = json_array[i];

//         json_data = preloader.getResult( json_array[i].toString() );
//         animations = json_data.animations;

//         if( null == animations )
//             continue;

//         // Method 1
//         for( key in animations ) {

//             if( name == key ) {

//                 res.json_id = json_array[i];
//                 res.frame = json_data.frames[animations[key]];

//                 return res;
//             }
//         }
        
//         // Method 2: 生成animations的key的数组, 不支持低版本浏览器
//         // var keylist = Object.keys(animations);

//     }
// }


function getJson( name ) {

    var json_data
        , json_id
        , animations
        , key
        , res = {};

    if( !name )  return null;

    for( var i=0; i < json_array.length; i++ ) {
        
        json_id = json_array[i];

        json_data = preloader.getResult( json_array[i].toString() );
        animations = json_data.animations;

        if( !animations ) continue;

        for( key in animations ) {

            if( name == key ) {

                res.frame = json_data.frames[animations[key]];
                res.image = json_data.images[0].id;

                return res;
            }
        }

    }
}

// function mapController ( key ) {

//     // json 和 png 图片映射表
//     var _jsonMap = {
//         'json_0': 'img_0',
//         'json_1': 'img_1'
//     };

//     if( null == key)
//         return null;
//     else 
//         return _jsonMap[key];
    
// }


