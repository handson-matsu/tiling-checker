import test from 'node:test';
import assert from 'node:assert/strict';
import {isBack,pieceAppearance} from '../src/appearance.js';
import {worldEdges} from '../src/geometry.js';
const state=backs=>({backs,backColor:true,layout:'opposite',pairs:[{mark:'heart',color:'#ee7385'},{mark:'spade',color:'#689fe5'}]});
const appearances=(s,t)=>s.backs.map((_,i)=>pieceAppearance(s,i,t,s.pairs[i%2].color));
test('all front pieces become gray backs after tile reflection',()=>{
  const s=state([false,false,false,false]);
  assert(appearances(s,{flip:false}).every(p=>p.background==='#FFFFFF'));
  assert(appearances(s,{flip:true}).every(p=>p.back&&p.background==='#DCE2E6'));
});
test('all back pieces become white fronts after tile reflection',()=>{
  assert(appearances(state([true,true,true,true]),{flip:true}).every(p=>!p.back&&p.background==='#FFFFFF'));
});
test('mixed faces invert both background and mark tint',()=>{
  const s=state([true,false,true,false]);
  const a=appearances(s,{flip:false}),b=appearances(s,{flip:true});
  a.forEach((p,i)=>{assert.notEqual(p.back,b[i].back);assert.notEqual(p.background,b[i].background);assert.notEqual(p.markColor,b[i].markColor);});
});
test('turning a tile twice restores appearance and mark geometry exactly',()=>{
  const s=state([true,false,false,true]),t={flip:false,rotation:1};
  const a=appearances(s,t),edges=worldEdges(s,t);
  t.flip=!t.flip;t.flip=!t.flip;
  assert.deepEqual(appearances(s,t),a);assert.deepEqual(worldEdges(s,t),edges);
});
test('all rotations preserve face and color',()=>{
  const s=state([true,false,true,false]);
  for(const flip of [false,true])for(let rotation=0;rotation<4;rotation++)assert.deepEqual(appearances(s,{flip,rotation}),appearances(s,{flip,rotation:0}));
});
test('tint disabled keeps every background white and marks unchanged',()=>{
  const s=state([true,false,true,false]);s.backColor=false;
  for(const flip of [false,true])appearances(s,{flip}).forEach((p,i)=>{assert.equal(p.background,'#FFFFFF');assert.equal(p.markColor,s.pairs[i%2].color);assert.equal(p.back,isBack(s,i,{flip}));});
});
test('paper-piece and whole-tile reflection use the same face and colors',()=>{
  const s=state([true,false,true,false]),inverted={...s,backs:s.backs.map(b=>!b)};
  assert.deepEqual(appearances(s,{flip:true}),appearances(inverted,{flip:false}));
});
