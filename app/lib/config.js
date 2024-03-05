'use strict';


module.exports = {
    level : [
        {
            name: 'Level 1',
            cols_num: 11,
            start_rows: 5,
            add_rows: 1,
            misses_until_new_row: 5,
            colors: [1, 2, 3, 4, 5, 6]
        }
    ],
    img : {
        
        colors : [ "bubble_empty", "bubble1", "bubble2","bubble3","bubble4","bubble5","bubble6" ],
        score : ["pop_score_10", "pop_score_25", "pop_score_50", "pop_score_100", "pop_score_250", "pop_score_500", "pop_score_1000"],
        digit : ["score_digit_0", "score_digit_1", "score_digit_2","score_digit_3","score_digit_4","score_digit_5","score_digit_6","score_digit_7","score_digit_8","score_digit_9"],
        killLine : "killing_line",
        shootingArm : "shooting_arm",

        gameLogo : "game_logo",
        titleBubbles : "title_bubbles",
        buttonDefault : "button_default",
        buttonStatistics : "button_statistics",
        buttonPause : "button_pause"

    },
    map : {
        maxRows : 14,
        score : [ 10, 25, 50, 100, 250, 500, 1000 ],
        maxShot : 6,
        MAX_SAME_COLORS_IN_A_ROW : 3
    },
    speed : {

    },
    sound : {
        bonus : "bonus",
        burst : "burst",
        start : "start",
        snap : "snap",
        bounce : "bounce",
        shoot : "shoot",
        tap : "tap",
        game_over_failure : "game_over_failure",
        game_over_success : "game_over_success",
        new_row : "new_row"
    },
    css : {
        button : {
            font : {
                'default' : '80px Fantasy',
                'small' : '36px Fantasy'
            },
            color : {
                'default' : '#554714',
                'small' : '#3C3C4C'        
            },
            props : {
                bg : "button_default",
                x : 0, 
                y : 0,
                aglin : 'center',
                text : '', 
                font : 'default',
                color : 'default',
                shadow : false                
            }
        },
        title : {
            font : '100px Fantasy',
            color : '#FFED38'
        }
    },
    error : {
        no_param : '参数错误！',
        error_setting : '参数配置错误',

    }

}