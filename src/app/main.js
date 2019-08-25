import {init, GameLoop, Sprite, initKeys, keyPressed} from 'kontra'
import pawnIdle from './assets/pawn_idle.png';


initKeys();
let { canvas,context } = init();


//
// Define World Params and state methods
//

let world = {
    params:{
        gravity:0.2,
        endy:canvas.height - 60,
        pawnStart:{
            x:canvas.width/2,
            y:0,
        }
    },
    level:[
        Sprite({
            x:0,
            y:canvas.height-5,
            width:canvas.width,
            height:5,
            color:'rgba(51,156,128)'
        }),
    ],
    updateGravity:function(entities){
        for(let gravObj in entities) {

            entities[gravObj].v_speed  = (entities[gravObj].v_speed ) + (this.params.gravity * entities[gravObj].weight); 
            entities[gravObj].y = entities[gravObj].y + entities[gravObj].v_speed;

            // hit the ground
            if (entities[gravObj].y >= this.params.endy){
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
    // custom params
    v_speed:0,
    h_speed:0,
    weight:1,
    
});
//
// Load Image Assets and assign to objects
//

let image = new Image();
image.src = pawnIdle;
image.onload = function() {
    pawn.image = image;
    console.log(pawn);
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
        pawn.x = -sprite.width;
      }



        // handle keyboard inputs
        if (keyPressed('up')){
            pawn.v_speed -=0.5;
        }
        if (keyPressed('left')){
            pawn.h_speed -=0.1;
        }
        if (keyPressed('right')){
            pawn.h_speed +=0.1;
        }

      let gravityBoundObjects = [pawn];


      // move pawn horizontally

      pawn.x = pawn.x + pawn.h_speed;


      world.updateGravity(gravityBoundObjects);

    },
    render: function() { // render the game state
      pawn.render();

      for(let ent in world.level) {
          world.level[ent].render();
      }
    }
  });
  
  loop.start();    // start the game