import {init, GameLoop, Sprite,SpriteSheet, initKeys, keyPressed, on} from 'kontra'
import pawnIdle from './assets/pawn_idle.png';
import gameAudio from './gameAudio';
import rand from './rand';
import fontSheet from './assets/number-sheet.png';
import powerupIdle from './assets/powerup.png';

initKeys();
let { canvas,context } = init();

//
// Define World Params and state methods
//


let world = {
    timeSeq:0.1,
    frameCount:0,
    score:0,
    params:{
        gravity:0.2,
        endy:canvas.height - 60,
        pawnStart:{
            x:canvas.width/2,
            y:0,
        }
    },
    randomNum:rand.int(canvas.width),
    bgSprites:[],
    initBGSprites:function(){
        var gridCount = 500;
        for(var i = 0; i < gridCount; i++){
            var size = rand.range(2,8);
            var opacity = rand.range(0.4,1);
            var originx = rand.range(0,canvas.width);
            var originy = rand.range(0,canvas.height);
            this.bgSprites.push(Sprite({
                x:originx,
                y:originy,
                originx:originx,
                originy:originy,
                color:'RGBA(143, 214, 255,'+opacity+')',
                width:size,
                speed:rand.int(10),
                height:size,
                randomNum:rand.int(8),
            }));

        }
    },
    renderBGSprites:function(){

        for(var i in world.bgSprites){
            var spark = world.bgSprites[i];

            //spark.x = spark.x+(spark.randomNum)*world.randomNum;
           // spark.y = spark.y+(Math.cos( world.frameCount/25)*30 * Math.cos(2 * Math.PI * 2 / (100)));
          // console.log(spark.y);
          spark.y = spark.originy+(Math.abs(pawn.y/25)*spark.speed);
            spark.render();
        }
    },

    //
    // wrap objects around the screen
    //
    wrapObjects:function(){

        if (pawn.x > canvas.width) {
            pawn.x = 0;
          }
        if (pawn.x < -5) {
        pawn.x = canvas.width-50;
        }

        for(var enemyID in world.enemies) {
            if(typeof world.enemies[enemyID] !='undefined') {
                var enemy = world.enemies[enemyID].sprite;
                if(enemy.x > canvas.width){
                    enemy.x = 0;
                }
                if(enemy.x < -5){
                    enemy.x = canvas.width-50;
                }
            }
        }
        for(var bulletID in world.bullets) {
            if(typeof world.bullets[bulletID] !='undefined') {
                var bullet = world.bullets[bulletID].sprite;
                if(bullet.x > canvas.width){
                    bullet.x = 0;
                }
                if(bullet.x < -5){
                    bullet.x = canvas.width-50;
                }
            }
            
        }
    


    },
    //
    // check for collisions
    // 
    //
    checkForCollisions:function(){


        if(pawn.collidesWith(powerup.sprite) && powerup.active){
            pawn.hasPowerup = true;
            pawn.activatePowerup();
            powerup.active = false;
            gameAudio.powerup();
        }



        // check for collisions between enemies and bullets
        for(var enemyID in world.enemies){

            
            if(typeof world.enemies[enemyID] != 'undefined') {
                if (world.enemies[enemyID].sprite.collidesWith(pawn) && pawn.alive) {

                    pawn.death();
                    pawn.alive = false;
                }
            }

           
            
            for(var bulletID in world.bullets){
                if(typeof world.bullets[bulletID] != 'undefined') {
                    if (world.bullets[bulletID].sprite.collidesWith(pawn) && pawn.alive) {

                        pawn.death();
                        pawn.alive = false;
                    }
                }

                if(typeof world.bullets[bulletID] !='undefined' && typeof world.enemies[enemyID] != 'undefined') {


                   


                    if(world.bullets[bulletID].sprite.collidesWith(world.enemies[enemyID].sprite)){
                        world.enemyAI.enemyA.explode(world.enemies[enemyID]);
                       
                        world.createKillPoints(world.enemyAI.enemyPointValue[world.enemies[enemyID].sprite.type],{x:world.enemies[enemyID].sprite.x,y:world.enemies[enemyID].sprite.y});
                       
                        world.bullets.splice(bulletID,1);
                        world.enemies.splice(enemyID,1);
                        gameAudio.enemyDie1();
                        world.enemyAI.increaseDificulty();
                        
                        world.score +=100;

                    }
                }
                
                
            }
        }

 


    },
    //
    // Setup Kill Point Notice
    //
    killPoints:[],
    createKillPoints:function(points,origin){

        var scoreString = String(points);

        scoreString = scoreString.split("");

        scoreString.reverse();
        var killPointArray = [];
        

        for(var i = 0; i <scoreString.length;i++) {
            killPointArray[i] = Sprite({
                x: origin.x-(i*21),
                width:20,
                height:21,
                y: origin.y,
                opacity:1,
            
                // use the sprite sheet animations for the sprite
                animations: world.fontSheet.animations
              });
              killPointArray[i].playAnimation('f_0');
        }

        for(var i = 0; i < scoreString.length; i++) {
            killPointArray[parseInt(i)].playAnimation('f_'+scoreString[i]);
        }
        world.killPoints.push(killPointArray);
    },
    renderKillPoints:function(){
        for(var i in world.killPoints){
            var kp = world.killPoints[i];
            for(var id in kp){
                if(kp[id].opacity>0){
                kp[id].y -=5;
                kp[id].opacity -= 0.04; 
              
                  
                kp[id].render();
                } else {
                    world.killPoints.splice(i,1);
                }
            }
        }
    },

    // EnemyAI Logic
    //
    enemyAI:{
        enemyPointValue:{
            enemyA:199,
            enemyB:500,
            enemyC:1337
        },
        enemyA:{
            create:function(params){
                
                world.enemies.push(new EnemyA(params));
            },
            update:function(){

            },
            explode:function(enemy){
                let particleCount = 10;

                for(var i =0; i < particleCount; i++) {
                    world.level.push(Sprite({
                        x:enemy.sprite.x,
                        width:15,
                        height:15,
                        y:enemy.sprite.y,
                        color:'rgba(255,10,10,1)',
                        ddx:2,
                        ddy:2,
                        h_speed:10*Math.cos(2 * Math.PI * i / particleCount),
                        v_speed:10*Math.sin(2 * Math.PI * i / particleCount),
                        type:'particle',
                        colorFade:1,
                    }))
                }
            },
            render:function(){
                for(let ent in world.enemies) {
                    if(!world.enemies[ent].sprite.destroy) {
                      world.enemies[ent].sprite.render();
                    }
                  }
            }
        },
        increaseDificulty:function(){
            if(world.enemies.length<10){
                var seed = rand.int(3);
                if(seed<2) {
                    world.enemyAI.createFormation2();
                } else if(seed >2){

                } else {
                    world.enemyAI.createFormation3();
            
                }
            }

        },
        createFormation:function() {
            var origin = {
                x:rand.range(100,canvas.width/1.2),
                y:rand.range(100,canvas.height/1.2),
                color_r:0,
                color_g:191,
                color_b:252,
            };

            var seed = rand.int(1000);
            var gridCount = rand.int(20);
            for(var i = 3; i < gridCount; i++) {
                    let params = {
                        width:rand.range(14,20),
                        height:rand.range(14,20),
                        x:origin.x+(seed * Math.cos(seed * Math.PI * i / gridCount))/5,
                        y:origin.y +(seed * Math.sin(seed * Math.PI * i / gridCount))/5,
                        theta_increment: (seed*Math.PI),
                        tcos:i,
                        tsin:0,
                        h_speed:-1*i,
                        v_speed:1,
                        beta:Math.sin(2*Math.PI),
                        alpha:Math.sin((2*Math.PI)/2),
                        color_r:origin.color_r,
                        color_g:origin.color_g - (5*i),
                        color_b:origin.color_b - (5*i),
                        color_a:1,
                    }

                    world.enemyAI.enemyA.create(params);
            }
        },
        createFormation2:function() {
            var origin = {
                x:rand.range(100,canvas.width/1.2),
                y:rand.range(100,canvas.height/1.2),
                color_r:190,
                color_g:50,
                color_b:252,
                type:'enemyB'
            };

            var seed = rand.int(1000);
            var gridCount = rand.int(20);
            for(var i = 3; i < gridCount; i++) {
                    let params = {
                        width:rand.range(8,15),
                        height:rand.range(8,15),
                        x:origin.x+(seed * Math.cos(seed * Math.PI * i / gridCount) * Math.sin(seed * Math.PI * i / gridCount))/5,
                        y:origin.y+(seed * Math.sin(seed * Math.PI * i / gridCount))/5,
                        theta_increment: (seed*Math.PI),
                        tcos:i,
                        tsin:0,
                        h_speed:-1*i,
                        v_speed:1,
                        beta:Math.sin(2*Math.PI),
                        alpha:Math.sin((2*Math.PI)/2),
                        color_r:origin.color_r,
                        color_g:origin.color_g - (15*i),
                        color_b:origin.color_b - (15*i),
                        color_a:1,
                    }

                    world.enemyAI.enemyA.create(params);
            }
        },
        createFormation3:function(){
            var origin = {
                x:rand.range(100,canvas.width/1.2),
                y:rand.range(100,canvas.height/1.2),
                color_r:190,
                color_g:214,
                color_b:0,
                type:'enemyC'
            };

            var seed = rand.int(1000);
            var gridCount = rand.int(20);
            for(var i = 3; i < gridCount; i++) {
                    let params = {
                        width:rand.range(8,15),
                        height:rand.range(8,15),
                        x:(origin.x)+i*15,
                        y:origin.y+(seed * Math.sin(seed * Math.PI * i / gridCount))/5,
                        theta_increment: (seed*Math.PI),
                        tcos:i,
                        tsin:0,
                        h_speed:-1*i,
                        v_speed:1,
                        beta:Math.sin(2*Math.PI),
                        alpha:Math.sin((2*Math.PI)/2),
                        color_r:origin.color_r,
                        color_g:origin.color_g - (15*i),
                        color_b:origin.color_b - (15*i),
                        color_a:1,
                    }

                    world.enemyAI.enemyA.create(params);
            }
        },
        
        enemyAIUpdate:function(){
            for(let enemyID in world.enemies) {
                let enemy = world.enemies[enemyID];
                if(enemy.sprite.type =='enemyA') {
                    let Ncos,Nsin;
                    enemy.theta_increment +=0.02;
                    enemy.beta = Math.cos(enemy.theta_increment);
                    enemy.alpha = Math.sin(enemy.theta_increment/2);
                    enemy.alpha = 2 * enemy.alpha * enemy.alpha;
                    
                    Ncos = (enemy.alpha * enemy.tcos) + (enemy.beta * enemy.tsin);
                    Nsin = (enemy.alpha * enemy.tsin) + (enemy.beta * enemy.tcos);
                    
                    enemy.sprite.x = enemy.sprite.x + ((enemy.sprite.h_speed*Ncos) *-Math.cos(2 * Math.PI * enemy.theta_increment / world.enemies.length))/100 ;
                    enemy.sprite.y = enemy.sprite.y + ( (enemy.sprite.h_speed*Nsin) *-Math.cos(2 * Math.PI * enemy.theta_increment / world.enemies.length))/100;
                    enemy.sprite.update();
                   
                }
                if(enemy.sprite.type =='enemyC'){
                    enemy.sprite.y = enemy.sprite.original_y+(Math.cos( world.frameCount/25)*30 * Math.cos(2 * Math.PI * enemyID / (world.enemies.length/2)));
                    
                    

                }
            }
        },
    },

    gravityBoundObjects:[],
    level:[
        // Sprite({
        //     x:0,
        //     y:canvas.height-5,
        //     width:canvas.width,
        //     height:5,
        //     color:'rgba(51,156,128)'
        // }),
    ],
    updateLevelEntities:function(){
        for(let i in world.level) {
            let el = world.level[i];
            if(el.h_speed !=0 && typeof el.h_speed !='undefined'){
                el.x +=el.h_speed;
            }
            if(el.v_speed !=0 && typeof el.v_speed !='undefined'){
                el.y +=el.v_speed;
            }
            
        }
    },
    bullets:[],
    enemies:[],
    updateBullets:function(){
        for(let bullet in this.bullets) {
            this.bullets[bullet].sprite.h_speed -=0.1;
            
            this.bullets[bullet].sprite.x += this.bullets[bullet].sprite.h_speed;
            this.bullets[bullet].sprite.update();
             
        }
    },
    updateGravity:function(entities){
        for(let gravObj in entities) {

            entities[gravObj].v_speed  = (entities[gravObj].v_speed ) + (this.params.gravity * entities[gravObj].weight); 
            entities[gravObj].y = entities[gravObj].y + entities[gravObj].v_speed;

            // hit the ground
            if (entities[gravObj].y >= this.params.endy){
                entities[gravObj].h_speed = 0;
                if(entities[gravObj].type =='bullet') entities[gravObj].destroy = true;
                entities[gravObj].y = this.params.endy;
                entities[gravObj].v_speed *= -1.0; // change direction
                entities[gravObj].v_speed = entities[gravObj].v_speed*0.25; 
                    if ( Math.abs(entities[gravObj].v_speed) < 0.5 ) {
                        entities[gravObj].ypos = this.params.pawnStart.y;
                    }
                }
        }
    }
};

//
// increment frame tick
//
on('tick',function(){
    world.frameCount ++;
});


//
// Define Power Up
//

let powerup = {
    active:false,
    sprite:Sprite({
        x:0,
        y:100,
        width:14,
        height:40,
        randomNum:rand.int(8.42),
        originx:0,
        originy:0,
    }),
    sparkles:[
        Sprite({
            x:0,
            y:0,
            color:'RGBA(143, 214, 255, 1.00)',
            width:2,
            height:2,
            randomNum:rand.int(10),
        }),
        Sprite({
            x:0,
            y:0,
            color:'RGBA(143, 214, 255, 1.00)',
            width:2,
            height:2,
            randomNum:rand.int(10),

        }),
        Sprite({
            x:0,
            y:0,
            color:'RGBA(143, 214, 255, 1.00)',
            width:2,
            height:2,
            randomNum:rand.int(10),

        }),
        Sprite({
            x:0,
            y:0,
            color:'RGBA(143, 214, 255, 1.00)',
            width:2,
            height:2,
            randomNum:rand.int(10),

        }),
        Sprite({
            x:0,
            y:0,
            color:'RGBA(143, 214, 255, 1.00)',
            width:2,
            height:2,
            randomNum:rand.int(10),

        }),
        Sprite({
            x:0,
            y:0,
            color:'RGBA(143, 214, 255, 1.00)',
            width:5,
            height:5,
            randomNum:rand.int(10),

        }),
        Sprite({
            x:0,
            y:0,
            color:'RGBA(143, 214, 255, 1.00)',
            width:5,
            height:5,
            randomNum:rand.int(10),

        }),
        Sprite({
            x:0,
            y:0,
            color:'RGBA(143, 214, 255, 1.00)',
            width:5,
            height:5,
            randomNum:rand.int(10),

        }),
        Sprite({
            x:0,
            y:0,
            color:'RGBA(143, 214, 255, 1.00)',
            width:5,
            height:5,
            randomNum:rand.int(10),

        }),
        Sprite({
            x:0,
            y:0,
            color:'RGBA(143, 214, 255, 0.5)',
            width:2,
            height:2,
            randomNum:rand.int(10),

        }),
        Sprite({
            x:0,
            y:0,
            color:'RGBA(143, 214, 255, .5)',
            width:5,
            height:5,
            randomNum:rand.int(10),

        }),
        Sprite({
            x:0,
            y:0,
            color:'RGBA(143, 214, 255, 1.00)',
            width:2,
            height:2,
            randomNum:rand.int(10),

        }),
    ],
    showPowerup:function(origin){
        powerup.active = true;
        powerup.sprite.x = origin.x;
        powerup.sprite.y = origin.y;
        powerup.sprite.originx = origin.x;
        powerup.sprite.originy = origin.y;
        
        console.log(powerup);
    },
    renderPowerup:function(){
        if(powerup.active) {
            powerup.sprite.y = powerup.sprite.originy+(Math.cos( world.frameCount/25)*30 * Math.cos(2 * Math.PI * 2 / (10)));
            powerup.sprite.render();

            var loc = {
                x:powerup.sprite.x,
                y:powerup.sprite.y
            };
            var randomNum = powerup.sprite.randNum;
            for(var i in powerup.sparkles){
                var spark = powerup.sparkles[i];
                spark.x = -15+loc.x+(spark.randomNum)*powerup.sprite.randomNum;
                spark.y = loc.y+(3*i)+(Math.cos( world.frameCount/25)*30 * Math.cos(2 * Math.PI * 2 / (10)));
                spark.render();
            }
        }
    }
};

//
// Define Game Entities
//

let pawn = Sprite({
    x:canvas.width/2,
    y:0,
    width:40,
    height:50,
    // anchor:{
    //     x:0.5,
    //     y:0.5,
    // },
    //color:'rgba(255,255,255,1)',
    // custom params
    v_speed:0,
    h_speed:0,
    weight:1,
    fireDelay:5,
    fireDelayCount:0,
    type:'pawn',
    alive:true,
    activatePowerup:function(){

    },
    death:function() {
        let particleCount = 10;

        for(var i =0; i < particleCount; i++) {
            world.level.push(Sprite({
                x:pawn.x,
                width:15,
                height:15,
                y:pawn.y,
                color:'rgba(255,10,240,1)',
                ddx:2,
                ddy:2,
                h_speed:10*Math.cos(2 * Math.PI * i / particleCount),
                v_speed:10*Math.sin(2 * Math.PI * i / particleCount),
                type:'particle2',
                colorFade:1,
            }))
        }

        gameAudio.pawnDie();
    }
    
});


class EnemyA {
    constructor(params){
        if(!params.type) params.type = 'enemyA';
        this.sprite = Sprite({
            width:params.width,
            height:params.height,
            
            color:'RGBA('+params.color_r+', '+params.color_g+', '+params.color_b+', '+params.color_a+')',
            x:params.x,
            y:params.y,
            dx:0,
            ttl:10,
            // custom params
            color_r:0,
            color_g:191,
            color_b:252,
            color_a:1,
            v_speed:params.v_speed,
            h_speed:params.h_speed,
            weight:0.1,
            type:params.type,
        });
        this.theta_increment = params.theta_increment;
        this.tcos = params.tcos;
        this.tsin = params.tsin;
        this.beta = params.beta;
        this.alpha = params.alpha;
       
    }
}


world.gravityBoundObjects.push(pawn);


// get started, temp enemy generation
world.enemyAI.createFormation3();



class Bullet {
    constructor(params){
        this.sprite = Sprite({
            width:5,
            height:5,
            color:'red',
            x:params.x,
            y:params.y,
            dx:2,
            ttl:10,
            // custom params
            v_speed:0,
            h_speed:10,
            weight:0.1,
            type:'bullet',
        });
    }
}



//
// Load Image Assets and assign to objects
//

let image = new Image();
image.src = pawnIdle;
image.onload = function() {
    pawn.image = image;

};

let powerupImage = new Image();

powerupImage.src = powerupIdle;
powerupImage.onload = function(){
    powerup.sprite.image = powerupImage;
    powerup.showPowerup({x:canvas.width/3,y:canvas.width/3});

}

let fontSheetImage = new Image();
fontSheetImage.src = fontSheet;
fontSheetImage.onload = function() {
    world.fontSheet = SpriteSheet({
        image: fontSheetImage,
        frameWidth: 21,
        frameHeight: 26,
        frameMargin:1,
      });

      world.fontSheet.createAnimations({
        f_1: {
            frames: [0], 
          },
        f_2:{
            frames:[1],
        },
        f_3:{
            frames:[2],
        },
        f_4: {
            frames:[3]
        },
        f_5: {
            frames: [4], 
          },
        f_6:{
            frames:[5],
        },
        f_7:{
            frames:[6],
        },
        f_8: {
            frames:[7]
        },
        f_9: {
            frames:[8]
        },
        f_0: {
            frames:[9]
        },
      });


world.scoreSprite = [];
      var origin = {
          x:200,
          y:100
      };
    for(var i = 0; i <6;i++) {
        world.scoreSprite[i] = Sprite({
            x: origin.x-(i*21),
            y: origin.y,
        
            // use the sprite sheet animations for the sprite
            animations: world.fontSheet.animations
          });
          world.scoreSprite[i].playAnimation('f_0');
    }


    world.updateScoreSprite = function(){

        var scoreString = String(world.score);

        scoreString = scoreString.split("");

        scoreString.reverse();
        for(var i = 0; i < scoreString.length; i++) {
            world.scoreSprite[parseInt(i)].playAnimation('f_'+scoreString[i]);
        }
    }

   

  

};



//
// visgrid background
//

var visgrid = {
    dots:[],
    start:function(){
        var gridCount = 75;
        
        for(var i = 0; i < gridCount; i++)
        {
            var x = 0;
            var y = 550;
            
            x += (i*15)-50;
            y += (i*10)/2+150;
            
            if(i>15)
            {
            
                x = canvas.width/5;
                y = 545;
            
                x += ((i-15)*15)+50;
                y += ((i-15)*10)/2+150;
            }
        
            if(i>30)
            {
                x = canvas.width/3;
                y = 540;
            
                x += ((i-30)*15)+50;
                y += ((i-30)*10)/2+150;
            }
        
            if(i>45)
            {
                x = canvas.width/1.8;
                y = 535;
            
                x += ((i-45)*15)+50;
                y += ((i-45)*10)/2+150;
            }
        
            if(i>60)
            {
                x = canvas.width/1.25;
                y = 530;
            
                x += ((i-60)*15)+50;
                y += ((i-60)*10)/2+150;
            }
        
            
            visgrid.dots.push(new Dot(x,y,i,visgrid.dots));
        }
    }
};

//
// dot class
//


class Dot {
    // global variables in class
    constructor(xin, yin,idInt,dotArray) {
        this.x = xin; 
        this.y = yin;
        this.original_x = xin;
        this.original_y = yin;
        this.id = idInt;
        this.others = dotArray;
        this.yoff;        // 2nd dimension of perlin noise
        this.randNum = rand.int(8.42);
        this.sprite = Sprite({
            x:xin,
            y:yin,
            width:2,
            height:2,
            color:'RGBA(0, 190, 204, 1.00)',

        });
        
    }; 
        
    move()
        {
    
            //y -= others[id+1].y/2;
            var item = this.id;
            world.timeSeq +=0.001;
            
            
            
            
            this.y = this.original_y+(Math.cos( world.frameCount/25)*30 * Math.cos(2 * Math.PI * item / (this.others.length/2)));
            this.sprite.y = this.y;
            
        }
        
        
    display()
        {
            
             this.sprite.render();

            // stroke(#0090a1);
            // point(x+10*randNum,y+5*randNum);
            // point(x+3*randNum,y+9*randNum);
            // point(x-20*randNum,y-11*randNum);
            // point(x-7*randNum,y+5*randNum);
            
            var item = this.id+1;
            
            if(item<this.others.length && item!=16 && item!=31 && item!=46 && item!=61)
            {
              //  stroke(#0090a1);
             //   line(x,y,others[item].x,others[item].y);
             context.beginPath();
             context.strokeStyle = "RGBA(0, 190, 204, 0.5)";
             context.moveTo(this.x, this.y);
             context.lineTo(this.others[item].x, this.others[item].y);
             context.stroke(); 
            }
            if(item+15 < this.others.length && item!=16 && item!=31 && item!=46 && item!=61)
            {
              //  line(x,y,others[item+15].x,others[item+15].y);
              context.beginPath();
              context.strokeStyle = "RGBA(0, 190, 204, 0.25)";
              context.moveTo(this.x, this.y);
              context.lineTo(this.others[item+15].x, this.others[item+15].y);
              context.stroke(); 
            }
        }
    
    };

//visgrid.start();


world.initBGSprites();

//
// Game Loop
//


let loop = GameLoop({  // create the main game loop
    fps:60,
    update: function() { // update the game state
      pawn.update();
      

      // wrap the sprites position when it reaches
      // the edge of the screen
      world.wrapObjects();


        // handle keyboard inputs
        if (keyPressed('up')){
            if(pawn.v_speed > -5) {
                pawn.v_speed -=0.5;
            }
        }
        if (keyPressed('right')){
            if(pawn.h_speed < 5) {
                pawn.h_speed +=0.1;
            }
            if(pawn.rotation <= 0.3) {
                //pawn.rotation +=0.05;
            }
        }
        if (keyPressed('left')){
            if(pawn.h_speed > -5) {
                pawn.h_speed -=0.1;
            }
            if(pawn.rotation >= -0.3) {
              //  pawn.rotation -=0.05;
            }
        }
        if (keyPressed('space')){
            if(pawn.fireDelayCount > pawn.fireDelay) {
                    
                let bullet = new Bullet({
                    x:pawn.x+35,
                    y:pawn.y+10
                });
                world.gravityBoundObjects.push(bullet.sprite);
                // fire gun
                gameAudio.fire();
                world.bullets.push(bullet);
                pawn.fireDelayCount = 0;
            } else {
                pawn.fireDelayCount ++;
            }
        }

     

      // move pawn horizontally

      pawn.x = pawn.x + pawn.h_speed;
      if(pawn.rotation >0) {
       // pawn.rotation -=0.025;
      }else if(pawn.rotation < 0) {
       // pawn.rotation +=0.025;

      }
      
      world.updateBullets();

      world.updateGravity(world.gravityBoundObjects);

      // update enemyAI
      world.enemyAI.enemyAIUpdate();

      // update level entitiy positions based on set speeds
      world.updateLevelEntities();
      // collision checks 
      world.checkForCollisions();

      if(world.scoreSprite) {
        world.updateScoreSprite();
      }
       


    },
    render: function() { // render the game state
        if(pawn.alive) {
            pawn.render();
        }
      world.enemyAI.enemyA.render();
        
      for(let ent in world.bullets) {
          if(!world.bullets[ent].sprite.destroy) {
            world.bullets[ent].sprite.render();
          }
        }
      for(let ent in world.level) {

        //fade particles 
        if(world.level[ent].type =='particle'){
            world.level[ent].color = 'RGBA(253, 115, 38,'+world.level[ent].colorFade+')';
            world.level[ent].colorFade += -0.02;
            world.level[ent].width -=0.1;
            world.level[ent].height -=0.1;
        }
        if(world.level[ent].type =='particle2'){
            world.level[ent].color = 'RGBA(0, 115, 238,'+world.level[ent].colorFade+')';
            world.level[ent].colorFade += -0.02;
            world.level[ent].width -=0.1;
            world.level[ent].height -=0.1;
        }
          world.level[ent].render();
      }
     if(world.scoreSprite) {
         for(var i in world.scoreSprite) {
            world.scoreSprite[i].render();

         }
     }
     // render powerup
     powerup.renderPowerup();
     
     // render background sparks 
     world.renderBGSprites();
     // render kill points 
     world.renderKillPoints();

    //   // render the visgrid
    //   for(var i in visgrid.dots)
    //     {
    //         visgrid.dots[i].display();
    //         visgrid.dots[i].move();
    //     }
    }
  });
  
 loop.start();    // start the game
