import test from 'node:test';
import assert from 'node:assert/strict';
import {HAND_PARTS,HAND_LANDMARKS,handLandmarks,handAppearance,tileTransform} from '../src/hand.js';
const close=(a,b)=>a.forEach((v,i)=>assert(Math.abs(v-b[i])<1e-9));
test('hand is vector-based with index up and distinct thumb on the left',()=>{
 assert(HAND_PARTS.every(p=>p.tag==='path'));assert(HAND_LANDMARKS.index[1]<0);assert(HAND_LANDMARKS.thumb[0]<HAND_LANDMARKS.index[0]);assert.equal(HAND_LANDMARKS.wrist[1]-HAND_LANDMARKS.index[1],58);
});
test('hand follows every quarter turn and returns after four rotations',()=>{
 const tile={rotation:0,flip:false},before=handLandmarks(tile);
 for(let turn=1;turn<=4;turn++){tile.rotation=turn%4;for(const [name,[x,y]]of Object.entries(HAND_LANDMARKS))close(handLandmarks(tile)[name],[[x,y],[-y,x],[-x,-y],[y,-x]][turn%4]);}
 assert.deepEqual(handLandmarks(tile),before);
});
test('whole-tile flip mirrors thumb and changes orange to blue; two flips restore both',()=>{
 const tile={rotation:0,flip:false},before=handLandmarks(tile),color=handAppearance(tile);assert.equal(color.fill,'#F5C49B');tile.flip=true;
 for(const [name,[x,y]]of Object.entries(before))close(handLandmarks(tile)[name],[-x,y]);assert.equal(handAppearance(tile).fill,'#B7D9E8');assert.notEqual(handAppearance(tile).stroke,color.stroke);
 tile.flip=false;assert.deepEqual(handLandmarks(tile),before);assert.deepEqual(handAppearance(tile),color);
});
test('rotation preserves color and handedness; reflection reverses handedness',()=>{
 const area=p=>(p.index[0]-p.wrist[0])*(p.thumb[1]-p.wrist[1])-(p.index[1]-p.wrist[1])*(p.thumb[0]-p.wrist[0]);
 for(const flip of [false,true])for(let rotation=0;rotation<4;rotation++){
  assert.deepEqual(handAppearance({flip,rotation}),handAppearance({flip,rotation:0}));assert.equal(Math.sign(area(handLandmarks({flip,rotation}))),Math.sign(area(HAND_LANDMARKS))*(flip?-1:1));
 }
});
test('piece faces and tint do not influence hand appearance',()=>{
 const t={rotation:0,flip:false};assert.deepEqual(handAppearance({...t,backs:[true,true,true,true],backColor:true}),handAppearance(t));assert.deepEqual(handLandmarks({...t,backs:[true]}),handLandmarks(t));
});
test('rendering applies reflection then rotation exactly once',()=>{
 assert.equal(tileTransform({x:200,y:400,rotation:1,flip:true}),'translate(200 400) rotate(90) scale(-1 1)');close(handLandmarks({x:200,y:400,rotation:1,flip:true}).thumb,[205,425]);
});
