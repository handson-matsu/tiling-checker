import test from 'node:test';
import assert from 'node:assert/strict';
import {mismatchWarnings} from '../src/mismatch.js';
import {checkTiling,initialTiles,squareStructure,configureSquare} from '../src/geometry.js';
import {createPairs} from '../src/pairing.js';
const state=()=>({mode:4,layout:'opposite',origin:0,pairs:createPairs(squareStructure().groups),backs:[false,false,false,false],backColor:true});
test('matching edges have no warnings; each mismatch has one shared indicator',()=>{
 const s=state(),tiles=initialTiles();assert.equal(mismatchWarnings(checkTiling(s,tiles)).length,0);tiles[0].rotation=1;
 const results=checkTiling(s,tiles),warnings=mismatchWarnings(results);assert.equal(warnings.length,2);assert.equal(warnings.length,results.filter(r=>!r.match).length);
});
test('OFF hides only warnings and leaves the input verdicts unchanged',()=>{
 const s=state(),tiles=initialTiles();tiles[0].flip=true;const results=checkTiling(s,tiles),before=JSON.stringify(results);assert.equal(mismatchWarnings(results,false).length,0);assert.equal(JSON.stringify(results),before);assert(mismatchWarnings(results,true).length>0);
});
test('reversed copies of a shared edge are drawn only once',()=>{
 const edge={match:false,a:{ends:[[0,0],[200,0]]}};assert.equal(mismatchWarnings([edge,{...edge,a:{ends:[[200,0],[0,0]]}}]).length,1);
});
test('line width, endpoints, center badge scale with the full edge',()=>{
 const [w]=mismatchWarnings([{match:false,a:{ends:[[20,30],[420,30]]}}]);assert.deepEqual(w.center,[220,30]);assert.equal(w.width,12);assert.equal(w.radius,18);assert.deepEqual(w.start,[20,30]);assert.deepEqual(w.end,[420,30]);
});
test('4/6/8 modes show one warning for each mismatching whole boundary',()=>{
 for(const mode of [4,6,8]){const s=state();configureSquare(s,{mode});const tiles=initialTiles();tiles[0].rotation=1;tiles[2].flip=true;const results=checkTiling(s,tiles);assert.equal(results.length,24);assert.equal(mismatchWarnings(results).length,results.filter(r=>!r.match).length);}
});
