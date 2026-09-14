/* Original study library. Integer coordinates and a shared material palette. */
(() => {
  function draw(ctx,item,t=0,state='idle',face=1){
    if(item.enemy){CADEnemies.draw(ctx,item.enemy,item.enemySize,64,112,{state,time:t,facing:face});return;}
    if(item.jane){CADJane.draw(ctx,item.jane,64,112,{state,time:t,facing:face});return;}
    if(item.jessie){CADJessie.draw(ctx,item.jessie,64,112,{state,time:t,facing:face});return;}
    if(item.detailed){CADDetailedCharacters.draw(ctx,item.hero,64,102,{state,time:t,facing:face});return;}
    if(item.group==='Vehicles'){ctx.save();ctx.translate(64,40);ctx.scale(face,1);if(item.id==='night-car')CADFlightArt.car(ctx,0,0,t,state==='run'?Math.sin(t*3)*2:0);else CADFlightArt.enemy(ctx,0,Math.sin(t*3)*2,t,item.kind);if(state==='fire'){ctx.fillStyle='#b4ffe0';ctx.fillRect(item.id==='night-car'?27:-40,0,8,2);}ctx.restore();return;}
    const r=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);};
    const label=(s,x,y,c)=>{ctx.font='6px monospace';ctx.fillStyle=c;ctx.fillText(s,x,y);};
    const f=Math.floor(t*8)%8,action=state==='fire',step=state==='run';
    if(item.group==='Worlds'){
      if(item.id==='industrial'){CADWorld.draw(ctx,t);return;}
      if(CADEnvironmentArt[item.id]){CADEnvironmentArt[item.id](ctx,t);return;}
      const sky=item.id==='skyview';
      const poly=(color,pts)=>{ctx.fillStyle=color;ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(Math.round(x),Math.round(y)):ctx.moveTo(Math.round(x),Math.round(y)));ctx.closePath();ctx.fill();};
      // Both districts share the same moonlit night; their materials and lighting tell the story.
      r(sky?'#090d24':'#0d0a1b',0,0,320,180);r(sky?'#111b38':'#21122e',0,54,320,83);r(sky?'#151d34':'#281a2c',0,137,320,43);
      r('#b5bfd1',250,17,18,18);r('#707b99',247,20,6,13);r('#e4dcbf',254,15,10,2); // moon
      for(let i=0;i<22;i++)r(i%4===0?'#7ee1df':'#3d5078',(i*83)%320,7+(i*29)%43,1,1);
      if(sky){
        // Monumental upper-city civic axis: senate rotunda, council spire, temples and glass bridges.
        for(const [x,y,w,h] of [[-13,62,53,77],[53,78,37,61],[224,69,49,70],[283,88,45,51]]){
          r('#172a47',x-3,y-3,w+6,h+4);r('#52667c',x,y,w,h);r('#b2c5c6',x,y,w,2);r('#263d5a',x+5,y+7,w-10,h-10);
          for(let wy=y+14;wy<y+h-5;wy+=13)for(let wx=x+8;wx<x+w-7;wx+=10)r((wx+wy)%3?'#4d9ca3':'#c8b9d2',wx,wy,3,4);
          r('#87dfd7',x+3,y+h-4,w-6,2);r('#2d5270',x+w-7,y+3,4,h-7);
        }
        // Senate rotunda and council spire silhouette.
        r('#263f5c',103,62,69,76);r('#7f93a2',107,65,61,3);r('#c2c6c1',112,61,51,2);r('#c2c6c1',121,54,33,7);r('#d8cfbd',128,48,19,7);r('#8fb7bb',134,39,7,10);r('#d8cfbd',136,34,3,5);
        for(let x=115;x<166;x+=10){r('#bac7c5',x,72,3,61);r('#344f69',x+3,73,5,56);}r('#172a47',125,92,33,46);r('#8ed6d0',130,98,23,2);r('#d9cfb7',107,136,60,3);
        r('#d6d0bc',27,119,72,4);r('#5bd4d0',31,121,67,1);r('#d6d0bc',197,113,83,4);r('#5bd4d0',201,117,77,1);
        // Moving autonomous taxis and controlled beacon cones.
        const car=(Math.floor(t*22)%390)-55;r('#263b5b',car,43,30,5);r('#adbfc3',car+5,40,19,4);r('#6ff0df',car+8,40,10,1);r('#e681ad',car+3,48,5,2);r('#6ff0df',car+22,48,5,2);
        for(const x of [78,210]){ctx.globalAlpha=.18;r('#73e6da',x,126,2,27);ctx.globalAlpha=1;r('#e9d4a8',x-3,123,8,2);r('#73e6da',x-1,127,4,1);}
        r('#c5c6bf',0,151,320,29);r('#687f98',0,151,320,2);for(let x=0;x<320;x+=27){r('#a2b4b5',x,157,1,23);r('#536e87',x+2,160,19,1);}r('#51cbc8',0,176,320,2);
        for(const x of [72,244]){r('#5fd2c1',x,143,12,2);r('#294c62',x+2,146,8,8);r('#d0c4a7',x+3,142,5,1);}
        label('SENATE AXIS',108,148,'#b6d4ce');
      }else{
        // Recyke: buildings press in, light comes from failing signs and wet streets.
        for(const [x,y,w,h] of [[-12,55,70,99],[61,82,53,72],[120,48,73,106],[201,76,65,78],[269,42,60,112]]){
          r('#111626',x-3,y-3,w+6,h+4);r('#3c2c42',x,y,w,h);r('#654758',x,y,w,2);r('#222638',x+5,y+7,w-10,h-9);
          for(let wy=y+16;wy<y+h-5;wy+=12)for(let wx=x+8;wx<x+w-7;wx+=11)if((wx+wy)%4)r((wx+wy)%3?'#365762':'#834d73',wx,wy,3,4);
          for(let sy=y+6;sy<y+h-8;sy+=19)r('#705261',x+3,sy,2,10);r('#1a2030',x+w-8,y+3,4,h-7);
        }
        // Flickering vertical signs, readable at a glance without stealing the whole palette.
        const flick=Math.floor(t*7);for(const [x,y,w,h,text,c] of [[17,74,14,49,'EAT','#f46aab'],[92,65,18,40,'FIX','#62dfd5'],[176,78,16,49,'REC','#f7b15f'],[247,55,19,61,'YKE','#df70bf']]){r('#111626',x-3,y-3,w+6,h+6);r(c,x,y,w,h);r('#241b35',x+2,y+3,w-4,h-6);for(let i=0;i<text.length;i++)if((flick+i)%3)label(text[i],x+4,y+13+i*9,c);r(c,x-1,y+h-2,w+2,2);}
        // Trash, wet pavement and animated service steam.
        r('#171a29',0,145,320,35);r('#584050',0,145,320,2);for(let i=0;i<46;i++){const x=(i*47)%320,y=150+(i*13)%26;r(i%3?'#72605a':'#b47d5e',x,y,3+i%5,2);}
        for(const [x,y,w,h] of [[35,136,21,14],[58,141,18,9],[219,134,26,16],[278,143,25,10]]){r('#151d29',x,y,w,h);r('#7b5360',x+2,y,w-4,2);r('#3b6970',x+4,y+4,w-9,3);r('#d17b67',x+7,y+8,5,3);}
        for(let i=0;i<5;i++){const u=(t*.25+i*.2)%1;ctx.globalAlpha=(1-u)*.45;r('#b7a6a2',215+i*4+Math.sin(u*8)*3,138-u*30,3+u*4,4+u*4);ctx.globalAlpha=1;}
        // Graffiti strokes and overhead cables.
        for(const [x,y,c] of [[10,130,'#da5c9b'],[136,117,'#60d5c9'],[286,127,'#e89b63']]){r(c,x,y,2,14);r(c,x+2,y,8,2);r(c,x+8,y+2,2,6);r(c,x+2,y+7,8,2);r(c,x+12,y-2,2,16);}
        for(let x=0;x<320;x++){const y=68+Math.round(Math.sin(x/34)*7);r('#1a2435',x,y,1,1);if(x%43===0){r('#cf9d6d',x-1,y+1,3,2);r('#ef6daa',x,y+3,1,5);}}
        const spark=Math.floor(t*12)%19;if(spark<3){r('#f4d28b',49+spark*2,144-spark*4,2,2);r('#fff2bd',50+spark*2,145-spark*4,1,1);}
        r('#0c1522',0,173,320,7);r('#53ccc9',0,173,320,1);for(let x=4;x<320;x+=19){r('#d85a9b',x,176,7,1);r('#3e7c88',x+8,176,9,1);}
        label('RECYKE // LOWER CITY',101,168,'#bd8ca4');
      }
      return;
    }
    ctx.save();ctx.translate(60,65);ctx.scale(face,1);
    if(item.group==='Characters'){
      CADCharacters.draw(ctx,item.hero,0,0,{state,time:t,facing:1});
      if(item.variant==='siege'){r('#536b7a',-8,-26,5,7);r('#a0b9bb',-8,-26,5,2);r('#485767',6,-15,4,8);r('#dcaa67',6,-15,4,1);}
      if(item.variant==='courier'){r('#233342',-8,-26,4,13);r('#d2a970',-8,-26,4,2);r('#e6bf89',-5,-25,4,2);const flap=step?f%3:0;r('#b88454',-8-flap,-24,4,3);r('#73523e',-10-flap,-23,3,4);}
    } else if(item.group==='Weapons'){
      ctx.translate(action&&f<2?-2:0,-18);const long=item.id!=='pistol',w=long?36:23;
      r('#111e30',-18,-7,w,10);r('#536d7e',-17,-6,w-2,7);r('#acc0c1',-15,-6,w-6,1);r('#21354b',-10,-4,11,4);r(item.id==='shotgun'?'#d4a773':'#39f2df',3,-3,w-22,2);r('#172438',-9,2,5,10);r('#536071',-8,3,3,7);r('#111d2d',-16,1,7,4);
      if(item.id==='carbine'){r('#142136',-9,-11,14,3);r('#72c9cc',-6,-11,8,1);r('#445563',1,2,6,7);}
      if(item.id==='shotgun'){r('#9b6b4d',-17,-4,8,7);r('#ceab7f',-16,-4,6,1);r('#aabac1',5,1,13,2);}
      if(action&&f<2){r('#ffc77a',w-18,-6,7,7);r('#fff4d5',w-11,-4,6,3);r('#ffc77a',w-15,-8,2,11);}
    } else {
      ctx.translate(0,-7+Math.round(Math.sin(t*3)*2));const clean=item.id==='glide';
      r('#111c2e',-26,-4,52,7);r(clean?'#c8d0c8':'#87684e',-23,-5,46,3);r('#30465e',-21,0,42,4);r(clean?'#5be4d4':'#f5b975',-18,4,10,2+f%2);r(clean?'#5be4d4':'#f5b975',8,4,10,2+f%2);r('#c8eeeb',-17,-5,34,1);
      if(!clean){r('#ca9360',-9,-7,3,4);r('#a9b1a6',7,-6,6,2);r('#263e4e',-21,-3,12,1);}
      if(step||action){r(clean?'#49c8d3':'#e9a35f',-33-f%3,0,7,2);r('#fff0bd',-30,0,4,1);}
    }
    ctx.restore();
  }
  const entries=[
    ['jessie-big','Characters','Jessie / Big','A fresh 96-pixel-tall run-and-gun model in a fixed 128 × 128 cell. Black shades, copper hair, a teal vest and a muscular build. Separate leg and weapon poses keep the run moving while he fires. Open the Jessie workshop to compare both versions on the same grid.',{hero:'jessie',jessie:'big'}],
    ['jessie-mini','Characters','Jessie / Mini','A separately drawn 32-pixel-tall run-and-gun model in a fixed 48 × 48 cell. The same shades, copper hair, teal vest and carbine in compact pixel clusters. Shown at the same pixel zoom as big Jessie; his smaller size comes from fewer source pixels.',{hero:'jessie',jessie:'mini'}],
    ['jane-big','Characters','Jane / Big','A separately authored 96-pixel-tall model in the fixed 128 × 128 family. A magenta field jacket, warm skin, armored knees and a violet ponytail with delayed follow-through. Fourteen animation studies include a full 12-pose run, shooting, jumps, punches and kicks. Compare her against approved Jessie on the same native grid.',{hero:'jane',jane:'big'}],
    ['jane-mini','Characters','Jane / Mini','A separately drawn 32-pixel-tall model in a fixed 48 × 48 cell. Compact magenta and violet clusters retain Jane’s field jacket and waving ponytail across all fourteen animations. Shown at exactly the same pixel zoom as the big models, with her own native geometry and stable feet anchor.',{hero:'jane',jane:'mini'}],
    ['night-car','Vehicles','Jessie / Night Runner','A stolen armored hovercar. Jessie wears his black shades behind the canopy. Run cycles through five banking poses; fire previews the ion cannon.'],
    ['patrol-drone','Vehicles','Watch Patrol','Twin rotors and a bright targeting eye. The light aerial enemy in Night Chase.',{kind:'drone'}],
    ['interceptor','Vehicles','Skyview Interceptor','Swept armor, paired fins and cyan exhaust. A fast airborne street patrol.',{kind:'interceptor'}],
    ['blockade','Vehicles','Blockade Carrier','Heavy armored carrier with an exposed reactor and a three-shot cannon. The final encounter in Night Chase.',{kind:'boss'}],
    ['jane-courier','Characters','Jane / Courier','Legacy outfit study: a recycled courier pack and wind-tossed scarf for the routes below Skyview. This earlier body is preserved as an outfit reference; Jane / Big and Jane / Mini contain her approved-size rebuild.',{hero:'jane',variant:'courier'}],
    ...CADEnemies.entries.flatMap(entry=>['big','mini'].map(size=>[
      `${entry.id}-${size}`,entry.group,`${entry.name} / ${size==='big'?'Big':'Mini'}`,
      `${entry.description} ${size==='big'?'A 96px model in the fixed 128 × 128 cell.':'A separately authored 32px model in the fixed 48 × 48 cell.'} ${entry.group==='Drones'?'Size refers to the neutral aerial span.':'Standing height matches Jessie and Jane.'} ${CADEnemies.states(entry.id).length} native animation studies include movement, charging, attacks, hit reactions and destruction. Open the enemy workshop to compare both sizes and the heroes on one grid.`,
      {enemy:entry.id,enemySize:size}
    ])),
    ['pistol','Weapons','Ion Sidearm','Compact resistance blaster. Inspect the two-frame muzzle flash and recoil.'],
    ['carbine','Weapons','Arc Carbine','A scoped energy carbine with a cooling rail and extended power cell.'],
    ['shotgun','Weapons','Scrap Scattergun','Reclaimed steel barrels, a wooden grip and an oversized receiver.'],
    ['glide','Tools','Skyline Glideboard','A clean civilian hoverboard with paired cyan induction thrusters.'],
    ['scrapboard','Tools','Recyke Streetboard','A patched street board assembled from scrap and mismatched propulsion parts.'],
    ['skyview','Worlds','Skyview / Upper City','A moonlit civic district built around a monumental senate complex and luxury garden apartments. Senators cross spotless streets, approachable human officers help residents, flower planters line the plaza, and constant flying-car traffic glides through three controlled air lanes.'],
    ['recyke','Worlds','Recyke / Lower City','A grimy night canyon where the public train carries residents past a compulsory material-recovery line that sorts elite waste. Workers and wary locals live beneath flickering signs, robot patrols and sweeping surveillance cameras, among trash, cables, machinery, wet pavement and steam.'],
    ['industrial','Worlds','Skyview / Service District','The original playable industrial district: transit pylons, rail traffic and vent steam.']
  ].map(([id,group,name,description,extra])=>({id,group,name,description,...extra}));
  window.CADArt={draw,entries};
})();
