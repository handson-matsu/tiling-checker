import test from 'node:test';
import assert from 'node:assert/strict';
import {placeFlipButton} from '../src/floating-flip.js';
const size={width:104,height:44};
const bounds={left:0,top:0,right:600,bottom:600};
const tile={left:150,top:150,right:300,bottom:300};
test('floating action prefers right and avoids the selected tile',()=>{
 const p=placeFlipButton(tile,bounds,size);assert.equal(p.side,'right');assert(p.left>tile.right);
});
test('right-edge tile falls back to left',()=>{
 const p=placeFlipButton({left:450,top:150,right:600,bottom:300},bounds,size);assert.equal(p.side,'left');assert(p.left+size.width<450);
});
test('narrow board uses below or above when neither side fits',()=>{
 const b={left:0,top:0,right:150,bottom:600};
 assert.equal(placeFlipButton({left:0,top:100,right:150,bottom:250},b,size).side,'below');
 assert.equal(placeFlipButton({left:0,top:450,right:150,bottom:600},b,size).side,'above');
});
test('phone/tablet/desktop corners keep the entire button inside visible bounds',()=>{
 for(const width of [280,350,600,900])for(const x of [0,1,2,3])for(const y of [0,1,2,3]){
 const edge=width/4,b={left:8,top:8,right:width+8,bottom:width+8};
 const t={left:8+x*edge,top:8+y*edge,right:8+(x+1)*edge,bottom:8+(y+1)*edge};
 const p=placeFlipButton(t,b,size);assert(p.left>=b.left&&p.top>=b.top);assert(p.left+size.width<=b.right&&p.top+size.height<=b.bottom);
 }
});
test('partially visible tile clamps action into visible viewport',()=>{
 const p=placeFlipButton({left:220,top:-40,right:320,bottom:60},{left:8,top:8,right:350,bottom:400},size);
 assert(p.left>=8&&p.left+104<=350);assert(p.top>=8&&p.top+44<=400);
});
