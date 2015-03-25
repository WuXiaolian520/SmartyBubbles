/*
 * Resouce controller
 * 1:Preloade manifest
 * 2:Give the image or sounds
 */

'use strict';

var preloader
    , _manifest
    , _fileType
    , img_array = []    // The images list array.
    , json_array = []   // The jsons list array.
    , sound_array = [];

var resourceService = module.exports = {
    init: res_init,
    getBitmap : getBitmap, //TODO: give up the function
    getResConfig : getResConfig
};


function res_init(func) {

    prepaerSetting();

    // Loading power
    preloader = new createjs.LoadQueue(true);

    // Listener
    preloader.on("fileload", handleFileLoad);
    preloader.on("progress", handleProgress);
    preloader.on("error", handleError);
    preloader.on("complete", function() {
        console.log("...preloader is Complete...");
        func.call(this);
    }); 

    // Loading
    preloader.loadManifest( _manifest, true, 'res/' );

}


// Prepare the congif data in resourceService
function prepaerSetting() {

    // Set the source path map
    _manifest = [
        {src: 'sprites_0.png', id: 'img_0'},
        {src: 'sprites_1.png', id: 'img_1'},
        {src: 'sprites_0.json', id: 'json_0'},
        {src: 'sprites_1.json', id: 'json_1'},
        {src: 'sounds/ogg/start.ogg', id: 'start'},
        {src: 'sounds/ogg/snap.ogg', id: 'snap'}
    ]; 

    // Set the file type name
    _fileType = {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
        IMAGE : createjs.AbstractLoader.IMAGE,
        JSON : createjs.AbstractLoader.JSON,
        SOUND : createjs.AbstractLoader.SOUND
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
    // groupFiles(item);
    
    switch ( item.type ) {
        case _fileType.IMAGE:
            img_array.push(item.id);
            break;
        case _fileType.JSON:
            json_array.push( item.id );
            
            break;
        case _fileType.SOUND:
            sound_array.push( item.id );
            break;
    }
}


function handleError( event ) {

    // TODO: called when load error
    console.log(event);
    console.log("preloader error , src is = " + event.data.src);

}


// Group the files by type , saved in an array
// function groupFiles( item ) {

//     switch ( item.type ) {
//         case _fileType.IMAGE:
//             img_array.push(item.id);
//             break;
//         case _fileType.JSON:
//             json_array.push( item.id );
            
//             break;
//         case _fileType.SOUND:
//             sound_array.push( item.id );
//             break;
//     }
// }

/*
 * Get the bitmap , and a Bitmap represents an Image.
 * @param {String} name The name of image
 * @return {Bitmap} Returns the bitmap with pasting the image
 * TODO: Be deprecated
 */
function getBitmap( name ) {
    var json_res
        , image
        , frame;

    if( null == name )
        return null;

    json_res = traverseJson( name );
    
    if( null == json_res ) {
        return null;
    }
   
    frame = json_res.frame;
    var img_id = mapController( json_res.json_id );

    var bitmap = new createjs.Bitmap( preloader.getResult( img_id ) );
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
        , img_id
        , res = {};

    if( null == name )
        return null;

    json_res = traverseJson( name );
    
    if( null == json_res ) {
        return null;
    }

    img_id = mapController( json_res.json_id );

    res.frame = json_res.frame;
    res.url = preloader.getResult( img_id );
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
function traverseJson ( name ) {
    var json_data
        , animations
        , key;

    if( null == name )
        return null;

    for( var i=0; i < json_array.length; i++ ) {
        
        var json_id = json_array[i];
        json_data = preloader.getResult( json_array[i].toString() );
        animations = json_data.animations;

        if( null == animations )
            continue;

        // Method 1
        for( key in animations ) {

            if( name == key ) {
                var res = {};
                res.json_id = json_array[i];
                // res.value = animations[key];
                res.frame = json_data.frames[animations[key]];
                return res;
            }
        }
        
        // Method 2: 生成animations的key的数组, 不支持低版本浏览器
        // var keylist = Object.keys(animations);

    }
}


function mapController ( key ) {

    // json 和 png 图片映射表
    var _jsonMap = {
        'json_0': 'img_0',
        'json_1': 'img_1'
    };

    if( null == key)
        return null;
    else 
        return _jsonMap[key];
    
}
