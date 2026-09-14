// BIG: separately authored dimensions, openings, material clusters and detail spacing.
// No Mini raster, Mini recipe, or scaled Mini image is used to create this family.
module.exports={family:'big',cell:[128,128],actorHeight:96,actorAnchor:[64,112],viewport:[640,360],worldWidth:2560,floor:308,
 terrain:{w:48,h:48,lip:2,band:13,seamY:13,grout:2,mark:[5,6,32]},
 facade:{w:160,h:208,windows:[[20,19,42,55],[95,19,42,55]],course:28,panel:[31,114,91,70],blind:8,patches:[[13,91,43],[112,101,29],[60,191,51]]},
 shutter:{w:160,h:208,x:15,y:80,sw:130,sh:120,step:9,rivet:21},
 roof:{w:160,h:22,top:10},corner:{w:28,h:208,edge:10,step:29,stain:51},
 recess:{w:168,h:174,inset:27,slope:19},
 door:{w:104,h:142,x:16,y:30,opening:[72,112],rail:7,bolts:[[7,51],[7,83],[7,116]],boltW:13,handle:[74,88],handleH:19,panels:8,panelStep:12},
 pipeH:{w:64,h:15,bore:9,spacing:37},pipeV:{w:15,h:64,bore:9,spacing:37,vertical:true},elbow:{w:28,h:28,bore:9,x:15,y:5},
 vent:{w:48,h:48,cx:24,cy:24,rad:15,slats:6},lamp:{w:34,h:42,stem:16,drop:30,cap:9},
 scrap:{w:86,h:40,parts:[[[0,22,38,18,'rustDark'],[24,12,34,28,'steelDark'],[58,24,28,16,'plum']],[[4,18,24,22,'steelDark'],[36,25,48,15,'rustDark'],[20,3,29,35,'plum']],[[0,25,56,15,'rustDark'],[12,8,19,32,'steelDark'],[51,16,35,24,'wallFace']]],bits:[[7,37],[59,35],[76,14]]},
 skyline:{w:320,h:176,towers:[[0,49,49,127],[58,24,63,152],[132,80,45,96],[189,9,49,167],[251,41,69,135]],rows:19,cols:16},
 cable:{w:192,h:28,base:2,sag:19,knots:[20,77,158]},
 puddle:{w:112,h:18,outline:[[5,4],[83,0],[111,7],[98,14],[21,18],[0,11]],lines:[[20,4,63,'window'],[42,7,42,'violet'],[16,11,28,'teal']]},
 crate:[64,32],crateTall:[64,64],platform:{w:48,h:10,bolt:17},support:{w:10,h:80},drain:{w:48,h:13,step:5},
 sign:{w:38,h:69,text:'FIX',vertical:true},poster:{w:38,h:51},
 reuse:{bins:{rect:[245,239,159,69],anchor:[0,69]},press:{rect:[780,137,160,171],anchor:[0,171]},boiler:{rect:[1190,76,115,232],anchor:[10,232]}},
 train:{w:125,h:42,bodyH:39,winStep:25,winW:20,winH:14},
 physics:{speed:160,acceleration:1400,gravity:900,jumpSpeed:460,maxFallSpeed:620,playerWidth:28,playerHeight:90}
};
