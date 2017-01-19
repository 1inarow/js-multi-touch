/**
 * Created by pat on 1/18/17.
 */
// -----
// CONSTANTS
var MODE_NONE = 0;
var MODE_SCALE = 1;
var MODE_MOVE = 2;
var MOVE_THRESHOLD = 20;

// -----
// DISPLAY "CONTAINERS"
var canvas = document.getElementById("stageCanvas");
var stage = new createjs.Stage("mainCanvas");
createjs.Touch.enable(stage);

var hitArea = new createjs.Shape();
hitArea.graphics.beginFill("#f2f2f2").drawRect(0, 0, stage.canvas.width, stage.canvas.height);
stage.addChild(hitArea);

var testContent = new createjs.Shape();
testContent.graphics.beginLinearGradientFill(["blue", "red"], [0, 1], 0, 0, 0, stage.canvas.height).drawRoundRect(0, 0, stage.canvas.width, stage.canvas.height,5);
stage.addChild(testContent);

var mTouch = new createjs.Shape();
mTouch.graphics.beginFill("#ff0000").drawRect(0, 0, 100, 100);
stage.addChild(mTouch);


// -----
// VARIABLES
var mode = MODE_NONE;
var touches = [];
var scale_center = null;
var scale_init_dist = 0;
var scale_start = 1;
var scale_start_pt = null;
var move_start_pt = null;
var move_down_pt = null;
var move_current_pt = null;
var move_current_dist = 0;
var move_release_speed = 0;


// -----
// CAPTURE EVENTS
hitArea.addEventListener('pressmove', function(event) {
    event.preventDefault();
    for (var i = 0; i < touches.length; i++) {
        if (event.pointerID == touches[i].pointerID)
        {
            touches[i] = event;
        }
    }
}, false);

hitArea.addEventListener('mousedown', function (event) {
    event.preventDefault();
    var exists = false;
    for (var i = 0; i < touches.length; i++) {
        if (event.pointerID == touches[i].pointerID)
        {
            exists = true;
        }
    }
    if (!exists) {
        touches.push(event);
    }
}, false);

hitArea.addEventListener('pressup', function (event) {
    event.preventDefault();
    for (var i = touches.length - 1; i >= 0; i--) {
        if (event.pointerID == touches[i].pointerID)
        {
            touches.splice(i, 1);
        }
    }
}, false);


// -----
// FRAME TICKER
createjs.Ticker.addEventListener("tick", handleTick);
function handleTick(event) {
    if (!event.paused) {

        // -----
        // START / STOP MODE
        if (touches.length == 0) {
            if (mode == MODE_MOVE) {
                console.log("velocity: " + move_release_speed);
                // Throw it?
            }
            mode = MODE_NONE;
        }
        if (touches.length > 1 && move_current_dist < MOVE_THRESHOLD) {
            if (mode != MODE_SCALE) {
                // Start scale
                mode = MODE_SCALE;
                scale_center = getCenter(touches[0].stageX, touches[0].stageY, touches[1].stageX, touches[1].stageY);
                scale_init_dist = getDistance(touches[0].stageX, touches[0].stageY, touches[1].stageX, touches[1].stageY);
                scale_start = testContent.scaleX;
                scale_start_pt = {x: testContent.x, y: testContent.y};
            }
        } else if (touches.length > 0) {
            if (mode != MODE_MOVE) {
                // Start move
                mode = MODE_MOVE;
                move_start_pt = {x: testContent.x, y: testContent.y};
                move_down_pt = {x: touches[0].stageX, y: touches[0].stageY};
                move_current_pt = {x: touches[0].stageX, y: touches[0].stageY};
                move_release_speed = 0;
            }
        } else {
            // Cancel mode
            scale_center = null;
            move_current_dist = 0;
            mode = MODE_NONE;
        }

        // -----
        // UPDATE BASED ON MODE
        switch (mode) {
            // Scale it
            case MODE_SCALE:
                var nowDist = getDistance(touches[0].stageX, touches[0].stageY, touches[1].stageX, touches[1].stageY);
                testContent.scaleX = testContent.scaleY = scale_start + (nowDist - scale_init_dist)/500;
                testContent.x = scale_start_pt.x + scale_center.x * (scale_start - testContent.scaleX);
                testContent.y = scale_start_pt.y + scale_center.y * (scale_start - testContent.scaleX);
                break;

            // Move it
            case MODE_MOVE:
                move_release_speed = getDistance(move_current_pt.x, move_current_pt.y, touches[0].stageX, touches[0].stageY);
                move_current_pt = {x: touches[0].stageX, y: touches[0].stageY};
                move_current_dist = getDistance(move_current_pt.x, move_current_pt.y, move_down_pt.x, move_down_pt.y);
                if (move_current_dist >= MOVE_THRESHOLD) { // threshold for they want to drag
                    testContent.x = move_start_pt.x + (touches[0].stageX - move_down_pt.x);
                    testContent.y = move_start_pt.y + (touches[0].stageY - move_down_pt.y);
                }
                break;

            default:
                break;
        }

        // -----
        // DRAW VISUALS FOR WHAT WE HAVE
        mTouch.graphics.clear();
        for (var k = 0; k < touches.length; k++) {
            mTouch.graphics.beginFill(createjs.Graphics.getRGB(255, 0, 255, .5));
            mTouch.graphics.drawCircle(touches[k].stageX, touches[k].stageY, 40);
        }

        if (scale_center != null) {
            mTouch.graphics.beginFill(createjs.Graphics.getRGB(255, 128, 128, .5));
            mTouch.graphics.drawCircle(scale_center.x, scale_center.y, 20);
        }

        // Redraw the stage
        stage.update();
    }

}

// -----
// UTILITY FUNCTIONS
function getCenter (x1, y1, x2, y2) {
    return {x:x1 + (x2 - x1)/2, y: y1 + (y2 - y1)/2};
}
function getDistance (x1, y1, x2, y2) {
    var x = x2 - x1;
    var y = y2 - y1;
    return Math.sqrt((x * x) + (y * y));
}

