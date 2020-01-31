var camera = null;

function Camera() {
    this.x = 0;
    this.y = 0;
}

Camera.prototype.update = function(characterX, characterY) {
    if(characterX > 640) {
        this.x = characterX - 640;
        this.y = characterY;
    }
    else{
        this.x = 0;
        this.y = 0;
    }
}

function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function Background(game) {
    this.backAnimation = new Animation(ASSET_MANAGER.getAsset("./img/background.png"), 0,0,1280,720,100,1,true,false);
    Entity.call(this, game, 0, 0);
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
    Entity.prototype.update.call(this);
}

Background.prototype.draw = function (ctx) {
    this.backAnimation.drawFrame(this.game.clockTick, ctx, this.x-camera.x, this.y-camera.y);
    Entity.prototype.draw.call(this);
    ctx.fillStyle = "red";
    ctx.font = "20px Arial";
    ctx.fillText("A/D to move left/right", 10, 50);    
    ctx.fillText("R to roll", 10, 70);
    ctx.fillText("Space to Jump", 10, 90);
    ctx.fillText("L for attack animation", 10, 110);
    
}

function AttackWolf(game, theX) {
    this.walkBack = new Animation(ASSET_MANAGER.getAsset("./img/wolfsheet.png"), 0, 420, 88, 60, .1, 9, true, false);
    this.walk = new Animation(ASSET_MANAGER.getAsset("./img/wolfsheet.png"), 0, 960, 88, 60, .1, 9, true, false);
    this.attackF = new Animation(ASSET_MANAGER.getAsset("./img/wolfsheet.png"), 0, 780, 88, 60, .1, 10, true, false);
    this.attackBack = new Animation(ASSET_MANAGER.getAsset("./img/wolfsheet.png"), 0, 240, 88, 60, .1, 10, true, false);
    this.attack = false;
    this.back = false;
    Entity.call(this, game, theX, 655   );
}

AttackWolf.prototype = new Entity();
AttackWolf.prototype.constructor = AttackWolf;

AttackWolf.prototype.update = function () {
    if(this.game.entities.Character) {
        if(this.game.entities.Character.x - this.x > -32 && this.game.entities.Character.x - this.x < 0) {
            this.attack = true;
        }
        else {
            if(this.game.entities.Character.x - this.x > 38 && this.game.entities.Character.x - this.x < 70) {
                this.attack = true;
            }
            else {
                this.attack = false;
            }
        }
    
        if(this.game.entities.Character.x - this.x > 40) {
            this.back = false;
        }
        else {
            this.back = true;
        }

    }
    

    if(!this.attack) {
        if(this.back) {
            this.x = this.x - this.game.clockTick * 75
        }
        else {
            this.x = this.x + this.game.clockTick * 75
        }
    }
    Entity.prototype.update.call(this);
}

AttackWolf.prototype.draw = function (ctx) {
    if(this.attack && !this.back) {
        this.attackF.drawFrame(this.game.clockTick, ctx, this.x-camera.x, this.y-camera.y);
    }
    else if(this.attack && this.back) {
        this.attackBack.drawFrame(this.game.clockTick, ctx, this.x-camera.x, this.y-camera.y);
    }
    else if(this.back) {
        this.walkBack.drawFrame(this.game.clockTick, ctx, this.x-camera.x, this.y-camera.y);
    }
    else {
        this.walk.drawFrame(this.game.clockTick, ctx, this.x-camera.x, this.y-camera.y);
    }
    Entity.prototype.draw.call(this);
}
function Ghost(game, theX, theY) {
    this.appearA = new Animation(ASSET_MANAGER.getAsset("./img/ghost.png"), 0, 0, 64, 48, .15, 6, false, false);
    this.disappearA = new Animation(ASSET_MANAGER.getAsset("./img/ghost.png"), 0, 48, 64, 48, .15, 6, false, false);
    this.idleA = new Animation(ASSET_MANAGER.getAsset("./img/ghost.png"), 0, 96, 64, 48, .15, 6, false, false);
    this.scareA = new Animation(ASSET_MANAGER.getAsset("./img/ghost.png"), 0, 144, 64, 48, .15, 4, false, false);
    this.appear = true;
    this.disappear = false;
    this.idle = false;
    this.scare = false;
    Entity.call(this, game, theX, theY   );
}

Ghost.prototype.update = function() {
    if (this.appearA.isDone()) {
        this.appearA.elapsedTime = 0;
        this.appear = false;
        this.idle = true;
    }
    else if(this.idleA.isDone()) {
        this.idle = false;
        this.scare = true;
        this.idleA.elapsedTime = 0;
    }
    else if(this.scareA.isDone()) {
        this.scare = false;
        this.disappear = true;
        this.scareA.elapsedTime = 0;
    }
    else if(this.disappearA.isDone()){
        this.disappearA.elapsedTime = 0;
        if(this.game.entities.Character) {
            var ghost = new Ghost(this.game, (Math.floor(Math.random() * 301)) - 50 + this.game.entities.Character.x, -(Math.floor(Math.random() * 301)) + 50 + this.game.entities.Character.y);
            this.game.addEntity(ghost);
            this.removeFromWorld = true;
            this.disappear = false;
        }
    }
    Entity.prototype.update.call(this);
}

Ghost.prototype.draw = function (ctx) {
    if(this.appear) {
        this.appearA.drawFrame(this.game.clockTick, ctx, this.x-camera.x, this.y-camera.y);
    }
    else if(this.idle) {
        this.idleA.drawFrame(this.game.clockTick, ctx, this.x-camera.x, this.y-camera.y);
    }
    else if(this.scare) {
        this.scareA.drawFrame(this.game.clockTick, ctx, this.x-camera.x, this.y-camera.y);
    }
    else if(this.disappear) {
        this.disappearA.drawFrame(this.game.clockTick, ctx, this.x-camera.x, this.y-camera.y);
    }
    Entity.prototype.draw.call(this);
}
function Nightmare(game, theX, backbool) {
    this.runBackward = new Animation(ASSET_MANAGER.getAsset("./img/nightmare.png"), 0, 0, 144, 96, .20, 4, true, false);
    this.runForward = new Animation(ASSET_MANAGER.getAsset("./img/nightmare.png"), 0, 96, 144, 96, .20, 4, true, false);
    this.idleForward = new Animation(ASSET_MANAGER.getAsset("./img/nightmare.png"), 0, 192, 128, 96, .3, 4, false, false);
    this.idleBackward = new Animation(ASSET_MANAGER.getAsset("./img/nightmare.png"), 0, 288, 128, 96, .3, 4, false, false);
    this.idle = true;
    this.back = backbool;
    Entity.call(this, game, theX, 550);
}

Nightmare.prototype = new Entity();
Nightmare.prototype.constructor = Nightmare;

Nightmare.prototype.update = function () {
    if(this.x < 50) {
        this.back = false;
        this.idle = true;
    }
    if(this.x > 1250) {
        this.back = true;
        this.idle = true;
    }

    if(this.idleForward.isDone()) {
        this.idle = false;
        this.idleForward.elapsedTime = 0;
    }
    if(this.idleBackward.isDone()) {
        this.idle = false;
        this.idleBackward.elapsedTime = 0;
    }

    if(!this.idle && !this.back) {
        this.x = this.x + this.game.clockTick * 500;
    }
    else if(!this.idle && this.back) {
        this.x = this.x - this.game.clockTick * 500;
    }
    Entity.prototype.update.call(this);
}

Nightmare.prototype.draw = function (ctx) {
    if(this.idle && this.back) {
        this.idleBackward.drawFrame(this.game.clockTick, ctx, this.x-camera.x, this.y-camera.y);
    }
    else if(this.idle && !this.back) {
        this.idleForward.drawFrame(this.game.clockTick, ctx, this.x-camera.x, this.y-camera.y);
    }
    else if(!this.idle && this.back) {
        this.runBackward.drawFrame(this.game.clockTick, ctx, this.x-camera.x, this.y-camera.y);
    }
    else {
        this.runForward.drawFrame(this.game.clockTick, ctx, this.x-camera.x, this.y-camera.y);
    }
}
function Wolf(game, theX) {
   this.howl = new Animation(ASSET_MANAGER.getAsset("./img/wolfBack.png"), 0, 0, 88, 60, .25, 6, true, false);
    Entity.call(this, game, theX, 440);
}

Wolf.prototype = new Entity();
Wolf.prototype.constructor = Wolf;

Wolf.prototype.update = function () {
    Entity.prototype.update.call(this);
}

Wolf.prototype.draw = function (ctx) {
    this.howl.drawFrame(this.game.clockTick, ctx, this.x-camera.x, this.y-camera.y);
    Entity.prototype.draw.call(this);
} 



function MainCharacter(game) {
    this.walkAnim = new Animation(ASSET_MANAGER.getAsset("./img/KnightSheet.png"), 0, 64, 64, 64, .1, 8, true, false);
    this.backWalkAnim= new Animation(ASSET_MANAGER.getAsset("./img/KnightSheet.png"), 0, 384, 64, 64, .1, 8, true, false);
    this.attackBackAnim = new Animation(ASSET_MANAGER.getAsset("./img/KnightSheet.png"), 0, 448, 64, 64, .1, 12, false, false);
    this.attackForwardAnim = new Animation(ASSET_MANAGER.getAsset("./img/KnightSheet.png"), 0, 128, 64, 64, .1, 12, false, false);
    this.idleBackAnim = new Animation(ASSET_MANAGER.getAsset("./img/KnightSheet.png"), 0, 576, 48, 64, .1, 15, true, false);
    this.idleAnim = new Animation(ASSET_MANAGER.getAsset("./img/KnightSheet.png"), 0, 256, 48, 64, .1, 15, true, false);
    this.jumpForward = new Animation(ASSET_MANAGER.getAsset("./img/KnightSheet.png"), 0, 0, 112, 64, .08, 14, false, false);
    this.jumpBackward = new Animation(ASSET_MANAGER.getAsset("./img/KnightSheet.png"), 0, 320, 112, 64, .08, 14, false, false);
    this.rollForward = new Animation(ASSET_MANAGER.getAsset("./img/KnightSheet.png"), 0, 192, 64, 64, .07, 15, false, false);
    this.rollBackward = new Animation(ASSET_MANAGER.getAsset("./img/KnightSheet.png"), 0, 512, 64, 64, .07, 14, false, false);
    this.jumping = false;
    this.stand = true;
    this.back = false;
    this.attack = false;
    this.roll = false;
    this.hp = 100;
    this.radius = 64;
    this.ground = 668;
    Entity.call(this, game, 0, 668);
}

MainCharacter.prototype = new Entity();
MainCharacter.prototype.constructor = MainCharacter;

MainCharacter.prototype.update = function () {
    if (this.game.space) {
        this.jumping = true; 
    }
    if(this.game.l) {
        this.attack = true;
    }
    if(this.game.r) {
        this.roll = true;
    }
    if(this.game.d || this.game.a) {
        this.stand = false;
        if(this.game.d == false) {
            this.back = true;
        }
        else {
            this.back = false;
        }
    }
    else {
        this.stand = true;
    }


    if (this.jumping) {

        if (this.jumpForward.isDone()) {
            this.jumpForward.elapsedTime = 0;
            this.jumpBackward.elapsedTime = 0;
            this.jumping = false;
            this.x = this.x + 70;
        }
        if(this.jumpBackward.isDone()) {
            this.jumpForward.elapsedTime = 0;
            this.jumpBackward.elapsedTime = 0;
            this.jumping = false; 

        }
        if(this.jumpBackward.elapsedTime > this.jumpForward.elapsedTime) {
            this.jumpForward.elapsedTime = this.jumpBackward.elapsedTime;
        }
        else if(this.jumpForward.elapsedTime > this.jumpBackward.elapsedTime) {
            this.jumpBackward.elapsedTime = this.jumpForward.elapsedTime;
        }
        var jumpDistance = this.jumpForward.elapsedTime / this.jumpForward.totalTime;
        var totalHeight = 100;

        if (jumpDistance > 0.5)
            jumpDistance = 1 - jumpDistance;

        //var height = jumpDistance * 2 * totalHeight;
        // var height = totalHeight*(-4 * (jumpDistance * jumpDistance - jumpDistance));
        // this.y = this.ground - height;
    }
    else if(this.attack) {
        this.roll = false;
        if (this.attackForwardAnim.isDone() || this.attackBackAnim.isDone()) {
            this.attackForwardAnim.elapsedTime = 0;
            this.attackBackAnim.elapsedTime = 0;
            this.attack = false;
        }
        else if(this.attackForwardAnim.elapsedTime > this.attackBackAnim.elapsedTime) {
            this.attackBackAnim.elapsedTime = this.attackForwardAnim.elapsedTime;
        }
        else if(this.attackBackAnim.elapsedTime > this.attackForwardAnim.elapsedTime) {
            
            this.attackForwardAnim.elapsedTime = this.attackBackAnim.elapsedTime;
        }
    }
    else if(this.roll) {
        this.attack = false;
        if (this.rollBackward.isDone() || this.rollForward.isDone()) {
            if(this.rollForward.isDone()) {
                this.x = this.x + 5;
            }
            else {
                this.x = this.x - 5;
            }
            this.rollForward.elapsedTime = 0;
            this.rollBackward.elapsedTime = 0;
            this.roll = false;
            this.game.r = false;
        }
        else if(this.rollForward.elapsedTime > this.rollBackward.elapsedTime) {
            this.x = this.x + this.game.clockTick * 200;
            this.rollBackward.elapsedTime = this.rollForward.elapsedTime;
        }
        else if(this.rollBackward.elapsedTime > this.rollForward.elapsedTime) {
            this.x = this.x - this.game.clockTick * 200;
            this.rollForward.elapsedTime = this.rollBackward.elapsedTime;
        }
    }


    if(this.game.d && !this.roll) {
        if(this.game.c) {
            this.x = this.x + this.game.clockTick * 900;
        }
        else {
            this.x = this.x + this.game.clockTick * 300;
        }
    }
    if(this.game.a && !this.roll) {
        if(this.game.c) {
            this.x = this.x - this.game.clockTick * 900
        }
        else {
            this.x = this.x - this.game.clockTick * 300
        }
        
    }
    if(this.x < 300) {
        this.x = 300;
    }
    if(camera != null) {
        camera.update(this.x, 0);
    }
    
    Entity.prototype.update.call(this);
}

MainCharacter.prototype.draw = function (ctx) {
    if (this.jumping && !this.back) {
        this.jumpForward.drawFrame(this.game.clockTick, ctx, this.x-camera.x, this.y-camera.y);
    }
    else if(this.jumping && this.back) {
        if(this.jumpBackward.currentFrame == 0) {
            this.x = this.x - 50
        }
        this.jumpBackward.drawFrame(this.game.clockTick, ctx, this.x-camera.x, this.y-camera.y);
    }
    else if(this.roll && this.back) {
        this.rollBackward.drawFrame(this.game.clockTick, ctx, this.x-camera.x, this.y-camera.y);
    }
    else if(this.roll && !this.back) {
        this.rollForward.drawFrame(this.game.clockTick, ctx, this.x-camera.x, this.y-camera.y);
    }
    else if(this.attack && this.back) {
        this.attackBackAnim.drawFrame(this.game.clockTick, ctx, this.x-camera.x, this.y-camera.y);
    }
    else if(this.attack && !this.back) {
        this.attackForwardAnim.drawFrame(this.game.clockTick, ctx, this.x-camera.x, this.y-camera.y);
    }
    else if(this.stand == false && this.back == false) {
        this.walkAnim.drawFrame(this.game.clockTick, ctx, this.x-camera.x, this.y-camera.y);
    }
    else if(this.stand == false && this.back == true) {
        this.backWalkAnim.drawFrame(this.game.clockTick, ctx, this.x-camera.x, this.y-camera.y);
    }
    else if(this.stand == true && this.back == false){
        this.idleAnim.drawFrame(this.game.clockTick, ctx, this.x-camera.x, this.y-camera.y);
    }
    else {
        this.idleBackAnim.drawFrame(this.game.clockTick, ctx, this.x-camera.x, this.y-camera.y);
    }
    Entity.prototype.draw.call(this);
}


// the "main" code begins here

var ASSET_MANAGER = new AssetManager();
ASSET_MANAGER.queueDownload("./img/background.png")
ASSET_MANAGER.queueDownload("./img/RobotUnicorn.png");
ASSET_MANAGER.queueDownload("./img/KnightSheet.png");
ASSET_MANAGER.queueDownload("./img/wolfBack.png");
ASSET_MANAGER.queueDownload("./img/wolfsheet.png");
ASSET_MANAGER.queueDownload("./img/ghost.png");
ASSET_MANAGER.queueDownload("./img/nightmare.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');
    camera = new Camera();
    var gameEngine = new GameEngine();
    var bg = new Background(gameEngine);
    var maincharacter = new MainCharacter(gameEngine);
    var wolf1 = new Wolf(gameEngine, 335);
    var wolf2 = new Wolf(gameEngine, 365);
    var wolf3 = new AttackWolf(gameEngine, 1500);
    var ghos = new Ghost(gameEngine, 400, 400);
    var ghos1 = new Ghost(gameEngine, 500, 400);
    var nightmare = new Nightmare(gameEngine, 500, true);
    gameEngine.addEntity(bg);
    gameEngine.addEntity(wolf1);
    gameEngine.addEntity(wolf2);


    gameEngine.entities.Character = maincharacter;
    gameEngine.addEntity(wolf3);
    gameEngine.addEntity(ghos);
    gameEngine.addEntity(ghos1);
    gameEngine.addEntity(nightmare);
    
 
    gameEngine.init(ctx);
    gameEngine.start();
});
