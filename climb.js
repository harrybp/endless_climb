// ----------------------------------------------------------------------------
// Game parameters
var gameSize = 300;
var playerSize = 20;
var gravity = 2;
var frameLength = 20;
var maxPlatformDelay = 100; //Time between platforms
var minPlatformDelay = 60;
var platformDelay;
var playerSpeed = 5; //Speed at which player moves
var jumpSpeed = 20; //Power of jump
var maxPlatformHeight = 50;
var paused;
var platformSpeed;
var gamemode;

initGame();

// ----------------------------------------------------------------------------
// Init Game
// Create the canvas element and start the game engine
function initGame(){

    //Reset variables
    gamemode = 1;
    platformDelay = 0;
    dead = false;
    timeToNextPlatform = platformDelay;
    jumpCount = 0;
    xSpeed = 0;
    gravSpeed = 0;
    score = 0;
    paused = false;
    platformSpeed = 1;

    //Create game container
    var cont = document.createElement("div");
    $(cont).addClass("container");
    $(cont).attr("id", "cont");
    $(cont).width(gameSize);
    $(cont).height(gameSize);
    var body = $("body")
    $(body[0]).append(cont);
    var playZone = document.createElement("div");
    $(playZone).addClass("playZone");
    $(playZone).width(gameSize);
    $(playZone).height(gameSize- maxPlatformHeight);
    $(playZone).css("top", maxPlatformHeight);
    $("#cont").append(playZone);

    //Create start platform
    createPlatform(playerSize*2, playerSize, gameSize/2, playerSize+maxPlatformHeight, "#b0ffad");

    //Create player
    var player = document.createElement("div");
    $(player).addClass("player");
    $(player).attr("id", "p1");
    $("#p1").width(playerSize);
    $("#p1").height(playerSize);
    $(player).css("left", gameSize/2);
    $(player).css("top", maxPlatformHeight);
    $("#cont").append(player);

    var scoreT = document.createElement("p");
    $(scoreT).addClass(score);
    $(scoreT).text("Score: 0");
    $(scoreT).attr("id", "score");
    $("#cont").append(scoreT);

    dead = false;
}


// ----------------------------------------------------------------------------
// Game state
var score;
var dead;
var gravSpeed;
var xSpeed;
var jumpCount;
var timeToNextPlatform;
var prevPlatform;

// ----------------------------------------------------------------------------
// Die
// Ends the game
function die(){
  dead = true;
  $("#p1").remove();
  $("#cont").remove();
  var platforms = $(".platform");
  for(i = 0; i < platforms.length; i++){
    $(platforms[i]).remove();
  }
  initGame();
}

// ----------------------------------------------------------------------------
// Calls updateFrame every 'frameLength' ms
var start = null;
window.requestAnimationFrame(step);
function step(timestamp){
    if(!start) start = timestamp;
    var progress = timestamp - start;
    if(progress > frameLength){
        start = timestamp;
        if(!paused){
            updateFrame();
        }

    }
    window.requestAnimationFrame(step);
}

// ----------------------------------------------------------------------------
// Update frame
function updateFrame(){
    score++;

    $("#score").text("Score: " + score);
    if(!dead){
        timeToNextPlatform--;
        if(timeToNextPlatform < 1){
            newPlatform();
            platformDelay = Math.floor(Math.random() * (maxPlatformDelay - minPlatformDelay) + minPlatformDelay);
            timeToNextPlatform = platformDelay;

        }
        var pos = $("#p1").position();
        var newTop = pos.top;
        var newLeft = pos.left;
        movePlatforms();

        newTop = yAccelerate(newTop, newLeft);
        if(newTop < 0){
            die();
            return false;
        }
        newLeft = xMove(newTop, newLeft);
        $("#p1").css("top", newTop);
        $("#p1").css("left", newLeft);
    }
    else{
        $("#p1").remove();
    }
}

// ----------------------------------------------------------------------------
// X-Move
function xMove(top, left){
    left += xSpeed;
    var check = checkPlatforms(top, left);
    if(check != null){
        if( xSpeed > 0){
            left = check[1] - playerSize;
        } else {
            left = check[1] + check[2];
        }
    }

    if(left + playerSize > gameSize){
        left = gameSize - playerSize;
    } else if(left < 0){
        left = 0;
    }
    return left;
}

// ----------------------------------------------------------------------------
// Y-Accelerate
function yAccelerate(top, left){
    gravSpeed+=gravity;
    top += gravSpeed;

    //Check for clash with platforms
    var check = checkPlatforms(top, left);
    if(check != null){
        if(gravSpeed > 0){
            top = check[0] - playerSize;
            jumpCount = 0;
        } else {
            top = check[0] + check[3];
        }
        gravSpeed = 0;
    }

    //Check for clash with floor
    if(top + playerSize > gameSize){
        return -1;
    } else if(top < maxPlatformHeight) {
        top = maxPlatformHeight;
        gravSpeed = 0;
    }
    return top;
}

// ----------------------------------------------------------------------------
// Check playforms
// Collision checking
function checkPlatforms(top, left){
    //Check for clash with platforms
    var platforms = $(".platform");
    for(i = 0; i < platforms.length; i++){
        var platPos = $(platforms[i]).position();
        var platTop = platPos.top;
        var platLeft = platPos.left;
        var platWidth = $(platforms[i]).width();
        var platHeight = $(platforms[i]).height();
        if(top + playerSize> platTop && top < platTop+platHeight && left + playerSize > platLeft && left < platLeft + platWidth ){
            //Return platform location and width if clash
            return [platTop, platLeft, platWidth, platHeight];
        }
    }
    return null;
}

// ----------------------------------------------------------------------------
// Keydown handler
window.onkeydown = function(e) {
    var key = e.keyCode ? e.keyCode : e.which;
    if(key == 38){
        if(jumpCount < 2){
            if(jumpCount > 0){
                gravSpeed = -(jumpSpeed/1.5);
            }else {
                gravSpeed = -jumpSpeed;
            }
            jumpCount ++;
        }
    }
    if (key == 39) {
        xSpeed = playerSpeed; //Right
    }else if (key == 37) {
        xSpeed = -playerSpeed; //Left
    }
    if(key == 80){
        paused = !paused;
    }
}

// ----------------------------------------------------------------------------
// Keyup handler
window.onkeyup = function(e) {
    var key = e.keyCode ? e.keyCode : e.which;
    if(key == 39 || key == 37){
        xSpeed = 0;
    }
}

// ----------------------------------------------------------------------------
// New platform
// Create a new platform to scroll down from the top
function newPlatform(){
    if(gamemode == 1){
        var width = Math.floor(Math.random() * (gameSize/1.5 - playerSize) + playerSize);
        var xOffset = Math.floor(Math.random() * (gameSize - width));
        var height = Math.floor(Math.random() * (maxPlatformHeight - playerSize) + playerSize);
        if(validNewPlatform(width, height, xOffset)){
            createPlatform(width, height, xOffset, 0,  "#7a7a7a");
        } else {
            newPlatform();
        }
    } else {
        var gap = Math.floor(Math.random() * gameSize-playerSize-20);
        createPlatform(gap, playerSize, 0, 0, "#7a7a7a");
        createPlatform(gameSize-gap-playerSize-20, playerSize, gap+playerSize+20, 0, "#7a7a7a");
    }
}

// ----------------------------------------------------------------------------
// Validate whether a new platform is actually reachable
function validNewPlatform(width, height, xOffset){

    var prevXOffset = $(prevPlatform).position().left;
    var prevTop = $(prevPlatform).position().top;
    var prevWidth = $(prevPlatform).width();

    console.log(xOffset + " : " + parseInt(xOffset + width));
    console.log(prevXOffset + " : " + parseInt(prevWidth + prevXOffset));
    var prevLeft = parseInt(prevXOffset);
    var prevRight = parseInt(prevXOffset + prevWidth);
    var left = parseInt(xOffset);
    var right = parseInt(xOffset + width);
    //console.log(prevTop);
    if(left < prevLeft && right > prevRight){
        console.log("DENIED");
        return false;

    } else {
        return true;
    }
}

// ----------------------------------------------------------------------------
// Create platform html object
function createPlatform(width, height, xOffset, yOffset, colour){
    var platform = document.createElement("div");
    $(platform).addClass("platform");
    $(platform).width(width);
    $(platform).height(height);
    $(platform).css("left", xOffset);
    $(platform).css("top", yOffset);
    $(platform).css("background-color", colour);
    $("#cont").append(platform);
    prevPlatform = platform;
}

// ----------------------------------------------------------------------------
// Move platform down
function movePlatforms(){
    var platforms = $(".platform");
    for(i = 0; i < platforms.length; i++){
        var platform = platforms[i];
        var pTop = $(platform).position().top;
        pTop+= platformSpeed;
        $(platform).css("top", pTop);
        var pHeight = $(platform).height();
        if(pTop + pHeight > gameSize){
            pHeight = gameSize - pTop;
            $(platform).height(pHeight);
        }
        if(pHeight < 1){
            $(platform).remove();
        }
    }
}
