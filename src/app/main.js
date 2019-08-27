import {init, GameLoop, Sprite, initKeys, keyPressed} from 'kontra'
import pawnIdle from './assets/pawn_idle.png';
import gameAudio from './gameAudio';
import rand from './rand';

initKeys();
let { canvas,context } = init();

//
// Define World Params and state methods
//


let world = {
    score:0,
    params:{
        gravity:0.2,
        endy:canvas.height - 60,
        pawnStart:{
            x:canvas.width/2,
            y:0,
        }
    },
    //
    // check for collisions
    // 
    //
    checkForCollisions:function(){

        // check for collisions between enemies and bullets
        for(var enemyID in world.enemies){
            for(var bulletID in world.bullets){
                if(world.bullets[bulletID].sprite.collidesWith(world.enemies[enemyID].sprite)){
                    world.enemyAI.enemyA.explode(world.enemies[enemyID]);
                    world.bullets.splice(bulletID,1);
                    world.enemies.splice(enemyID,1);
                    gameAudio.enemyDie1();
                    world.enemyAI.increaseDificulty();
                }
            }
        }

 // check for collisions between enemies and bullets
        for(var enemyID in world.enemies){
            if(world.enemies[enemyID].sprite.collidesWith(pawn)){
                
                world.enemyAI.enemyA.explode(world.enemies[enemyID].sprite);
                gameAudio.pawnDie();
                pawn.die = true;

            }
        }
         // check for collisions between enemies and bullets
        for(var bulletID in world.bullets){
            if(pawn.collidesWith(world.bullets[bulletID].sprite)){
                pawn.x = canvas.width/2;
                pawn.y = 0;
                world.enemyAI.enemyA.explode(pawn);
                world.bullets.splice(bulletID,1);
                gameAudio.pawnDie();
                pawn.die = true;

            }
        }


    },

    // EnemyAI Logic
    //
    enemyAI:{
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
                world.enemyAI.createFormation();
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
            }
        },
    },

    gravityBoundObjects:[],
    level:[
        Sprite({
            x:0,
            y:canvas.height-5,
            width:canvas.width,
            height:5,
            color:'rgba(51,156,128)'
        }),
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
// Define Game Entities
//

let pawn = Sprite({
    x:canvas.width/2,
    y:0,
    width:40,
    height:50,
    anchor:{
        x:0.5,
        y:0.5,
    },

    // custom params
    v_speed:0,
    h_speed:0,
    weight:1,
    fireDelay:5,
    fireDelayCount:0,
    type:'pawn',
    
});


class EnemyA {
    constructor(params){

        this.sprite = Sprite({
            width:15,
            height:15,
            
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
            type:'enemyA',
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
world.enemyAI.createFormation();



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




//
// Game Loop
//


let loop = GameLoop({  // create the main game loop
    update: function() { // update the game state
      pawn.update();
      

      // wrap the sprites position when it reaches
      // the edge of the screen
      if (pawn.x > canvas.width) {
        pawn.x = 0;
      }
      if (pawn.x < -5) {
        pawn.x = canvas.width-50;
      }



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
                pawn.rotation +=0.05;
            }
        }
        if (keyPressed('left')){
            if(pawn.h_speed > -5) {
                pawn.h_speed -=0.1;
            }
            if(pawn.rotation >= -0.3) {
                pawn.rotation -=0.05;
            }
        }
        if (keyPressed('space')){
            if(pawn.fireDelayCount > pawn.fireDelay) {
                    
                let bullet = new Bullet({
                    x:pawn.x+15,
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
        pawn.rotation -=0.025;
      }else if(pawn.rotation < 0) {
        pawn.rotation +=0.025;

      }
      
      world.updateBullets();

      world.updateGravity(world.gravityBoundObjects);

      // update enemyAI
      world.enemyAI.enemyAIUpdate();

      // update level entitiy positions based on set speeds
      world.updateLevelEntities();
      // collision checks 
      world.checkForCollisions();
    },
    render: function() { // render the game state
        if(!pawn.die) {
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
          world.level[ent].render();
      }
    }
  });
  
  loop.start();    // start the game