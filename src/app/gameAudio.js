
let gameAudio = {
    fire:function(){
        (function () {
            let a = new AudioContext
            let G=a.createGain()
            let D = [];
            for(let i in D=[21,22])
            {
              let o = a.createOscillator()
              if(D[i])
              {
                  o.connect(G)
                  G.connect(a.destination)
                  o.start(i*.1)
                  o.frequency.setValueAtTime(200*1.06**(13-D[i]),i*.1)
                  
                  G.gain.setValueAtTime(1,i*.1)
                  G.gain.setTargetAtTime(.0001,i*.1+.08,.005)
                  o.stop(i*.1+.09);
              }
            }
          
          })();
          
          

    },
    powerup:function(){
      (function () {
        let a = new AudioContext
  
        let D = [];
        for(let i in D=[[5,3],[7,2],[7,3],[8,2],[11,2],[12,1],[16,3],[17,3],[18,3],[20,1],[21,1],[22,1]])
        {
          let o = a.createOscillator()
          if(D[i])
          {
              o.connect(a.destination)
              o.frequency.value=280*1.06**(14-D[i][0])
              o.type='square'
              o.start(D[i][1]*.1)
              o.stop(D[i][1]*.1+.1);
          }
        }
      })();
      
    },
    pawnDie:function() {
      (function () {
        let a = new AudioContext
  
        let D = [];
        for(let i in D=[[24,1],[25,1],[25,2]])
        {
          let o = a.createOscillator()
          if(D[i])
          {
              o.connect(a.destination)
              o.frequency.value=100*1.06**(14-D[i][0])
              o.type='sawtooth'
              o.start(D[i][1]*.2)
              o.stop(D[i][1]*.2+.2);
          }
        }
      })();
      
      
    },
    freeLife:function(){
      (function () {
        let a = new AudioContext
  
        let D = [];
        for(let i in D=[[11,1],[11,3],[12,2],[15,2],[16,1],[16,3]])
        {
          let o = a.createOscillator()
          if(D[i])
          {
              o.connect(a.destination)
              o.frequency.value=440*1.06**(14-D[i][0])
              o.type='triangle'
              o.start(D[i][1]*.1)
              o.stop(D[i][1]*.1+.1);
          }
        }
      })();
      
    },
    enemyDie1:function(comboTimes) {
      if(!comboTimes) comboTimes = 1;
        (function () {
            let a = new AudioContext
      
            let D = [];
            for(let i in D=[[7,2],[18,1],[19,1],[20,1],[21,1],[21,2],[22,1],[22,2],[22,3],[23,1],[23,2],[23,3],[23,4],[23,5],[23,6],[24,1],[24,2],[24,3],[24,4],[24,5],[24,6],[24,7]])
            {
              let o = a.createOscillator()
              if(D[i])
              {
                  o.connect(a.destination)
                  o.frequency.value=(190+(30*comboTimes))*1.06**(14-D[i][0])
                  o.type='triangle'
                  o.start(D[i][1]*.04)
                  o.stop(D[i][1]*.04+.04);
              }
            }
          })();
          
          
    },
    jetpack:function(){
        (function () {
            let a = new AudioContext
      
            let D = [];
            for(let i in D=[[18,1],[18,2],[18,3],[18,4],[18,5],[19,1],[19,2],[19,3],[19,4],[19,5],[20,1],[20,2],[20,3],[20,4],[20,5],[21,1],[21,2],[21,3],[21,4],[21,5],[22,1],[22,2],[22,3],[22,4],[22,5],[25,1],[25,2],[25,3],[25,4],[25,5]])
            {
              let o = a.createOscillator()
              if(D[i])
              {
                  o.connect(a.destination)
                  o.frequency.value=300*1.06**(14-D[i][0])
                  
                  o.start(D[i][1]*.1)
                  o.stop(D[i][1]*.1+.1);
              }
            }
          })();
          
          
    },
    bgmusic:function(){
        (function () {
            let a = new AudioContext
            let G=a.createGain()
            let D = [];
            for(let i in D=[17,18,17,18,17,,19,20,19,20,19,20,,18,19,18,19,18,19])
            {
              let o = a.createOscillator()
              if(D[i])
              {
                  o.connect(G)
                  G.connect(a.destination)
                  o.start(i*.1)
                  o.frequency.setValueAtTime(150*1.06**(13-D[i]),i*.1)
                  o.type='triangle'
                  G.gain.setValueAtTime(1,i*.1)
                  G.gain.setTargetAtTime(.0001,i*.1+.08,.005)
                  o.stop(i*.1+.09);
              }
            }
          
          })();
          
          
    }
}




export default gameAudio;