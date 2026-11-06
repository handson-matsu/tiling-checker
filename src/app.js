import {pieceAppearance} from './appearance.js';
import {pairLabel,createPairs} from './pairing.js';
import {MARKS,COLORS,pieces,pieceEnds,piecePolygon,splitLines,squareStructure,configureSquare,pairPieces,pieceMarkPoints,path,checkTiling,initialTiles} from './geometry.js';
const $=s=>document.querySelector(s),NS='http://www.w3.org/2000/svg';
const defaults=()=>({mode:4,layout:'opposite',origin:0,pairs:createPairs(squareStructure().groups),backs:[false,false,false,false],backColor:false});
let state=defaults(),tiles=initialTiles(),selected=null,selectedPiece=null,pairMessage='';
const names=['上','右','下','左'];
function el(tag,attrs={},text){const e=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);if(text)e.textContent=text;return e;}
function drawTile(parent,tile,{interactive=false,index=0}={}){const outer=el('g',{transform:`translate(${tile.x||0} ${tile.y||0}) rotate(${tile.rotation*90}) scale(${tile.flip?-1:1} 1)`});parent.append(outer);if(interactive){outer.setAttribute('role','button');outer.setAttribute('tabindex','0');outer.setAttribute('data-tile',index);outer.setAttribute('aria-pressed',selected===index);outer.setAttribute('aria-label',`タイル${index+1}、${selected===index?'選択中、押すと90度回転':'押すと選択'}`);const click=()=>{if(selected===index){tiles[index].rotation=(tiles[index].rotation+1)%4;}else{selected=index;}render();};outer.addEventListener('click',event=>{event.stopPropagation();click();});outer.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();click();}});}
// White square paper, with colored marks entirely inside its boundary.
outer.append(el('rect',{x:-100,y:-100,width:200,height:200,fill:'#fff'}));
// All piece backgrounds are painted before marks and cutting lines.
const active=pieces(state);
for(const piece of active){
  const background=el('path',{d:path(piecePolygon(piece)),fill:pieceAppearance(state,piece.index,tile).background,'data-piece-background':piece.index});
  if(!interactive){
    background.setAttribute('data-piece-select',piece.id);background.setAttribute('role','button');background.setAttribute('tabindex','0');background.setAttribute('aria-label',`${pieceName(piece)}、ペア${pairLabel(piece.pair)}、ペア設定用に選択`);
    const choose=()=>choosePiece(piece.id);
    background.addEventListener('click',e=>{e.stopPropagation();choose();});
    background.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose();}});
  }
  outer.append(background);
}
for(const piece of active){
  const pair=state.pairs[piece.pair];
  const appearance=pieceAppearance(state,piece.index,tile,pair.color);
  outer.append(el('path',{d:path(pieceMarkPoints(state,piece)),fill:appearance.markColor,stroke:'#263238','stroke-width':1.5,'stroke-linejoin':'round','data-piece-mark':piece.index,'pointer-events':interactive?'auto':'none'}));
  const [a,b]=pieceEnds(piece);
  const labelScale=piece.end-piece.start===1?.09:.19;
  const pos=[(a[0]+b[0])*labelScale,(a[1]+b[1])*labelScale];
  outer.append(el('text',{x:pos[0],y:pos[1],'text-anchor':'middle','dominant-baseline':'middle','pointer-events':'none','font-size':piece.end-piece.start===1?8:7,fill:'#617078',transform:`translate(${pos[0]} ${pos[1]}) scale(${tile.flip?-1:1} 1) rotate(${-tile.rotation*90}) translate(${-pos[0]} ${-pos[1]})`},`${pairLabel(piece.pair)} ${appearance.label}`));
}
for(const [a,b] of splitLines(state)){
  outer.append(el('path',{d:`M${a} L${b}`,stroke:'#5c666b','stroke-width':1,'stroke-dasharray':'4 4','data-cut-line':'true','pointer-events':'none'}));
}
outer.append(el('rect',{x:-100,y:-100,width:200,height:200,fill:'none',stroke:'#263238','stroke-width':1.5,'pointer-events':'none'}));
if(!interactive&&selectedPiece){
 const chosen=active.find(p=>p.id===selectedPiece);
 if(chosen)for(const piece of active.filter(p=>p.pair===chosen.pair))outer.append(el('path',{d:path(piecePolygon(piece)),fill:'none',stroke:'#237e73','stroke-width':2,'stroke-dasharray':'4 3','pointer-events':'none','data-editor-selection':'true'}));
}
return outer;}
function svg(box){return el('svg',{xmlns:NS,viewBox:box,'aria-label':'白い正方形と色付きの半分のマーク'});}
function render(){const count=pieces(state).length;$('#piece-mode').value=state.mode;$('#pair-selection').textContent=pairMessage||'同じ辺の半分ピースが1組のペアです。完全な形は隣接タイルとの境界で確認します。';$('.badge').textContent=`正方形 · ${count}ピース`;$('#piece-description').textContent=`点線に沿って切り分ける${count}枚のパーツ`;const p=svg('-115 -115 230 230');drawTile(p,{rotation:0,flip:false});$('#preview').replaceChildren(p);const b=svg('-115 -115 830 830');tiles.forEach((t,i)=>drawTile(b,t,{interactive:true,index:i}));const results=checkTiling(state,tiles);for(const r of results.filter(r=>!r.match)){b.append(el('path',{d:`M${r.a.ends[0]} L${r.a.ends[1]}`,fill:'none',stroke:r.match?'#20836c':'#ca4d56','stroke-width':3,'stroke-dasharray':'7 6','pointer-events':'none',opacity:.9}));}const t=selected===null?null:tiles[selected];if(t)b.append(el('rect',{x:t.x-94,y:t.y-94,width:188,height:188,rx:6,fill:'none',stroke:'#233f49','stroke-width':3,'stroke-dasharray':'12 7','pointer-events':'none','data-selection':'true'}));$('#board').replaceChildren(b);const good=results.filter(r=>r.match).length;$('#status').textContent=`隣接する${results.length}辺中 ${good}辺が一致 ／ ${results.length-good}辺が不一致`;$('#flip').disabled=!t;$('#one-reset').disabled=!t;$('#selection').textContent=t?`選択：${Math.floor(selected/4)+1}行 ${selected%4+1}列 · ${t.rotation*90}° · ${t.flip?'裏返し':'通常'}`:'タイルを選択してください。選択中のタイルを再度押すと90°回転します。';}
function pieceName(piece){
 const locations=[['左半分','右半分'],['上半分','下半分'],['右半分','左半分'],['下半分','上半分']];
 return names[piece.edge]+(piece.end-piece.start<1?`・${locations[piece.edge][piece.segment]}`:'');
}
function choosePiece(id){
 if(selectedPiece===id){selectedPiece=null;pairMessage='選択を解除しました。';}
 else if(selectedPiece===null){selectedPiece=id;const p=pieces(state).find(p=>p.id===id);pairMessage=`${pieceName(p)}を選択中。組にするピースを選んでください。`;}
 else if(pairPieces(state,selectedPiece,id)){selectedPiece=null;pairMessage='ペア構成を反映しました。各ペアは2ピースです。';}
 else{pairMessage='半分ピースは同じ辺の2区間でペアにします。通常ピースは通常ピース同士を選んでください。';}
 controls();render();
}
function controls(){
 const active=pieces(state),host=$('#pairs');host.replaceChildren();
 state.pairs.forEach((pair,i)=>{
  const f=document.createElement('fieldset'),l=document.createElement('legend');l.textContent=`ペア${pairLabel(i)}`;f.append(l);
  const members=document.createElement('p');members.className='hint';members.textContent=pair.members.map(id=>pieceName(active.find(p=>p.id===id))).join(' ＋ ');f.append(members);
  const label=document.createElement('label');label.textContent='マーク';
  const select=document.createElement('select');select.id=`pair-mark-${i}`;
  for(const [key,m]of Object.entries(MARKS)){const option=document.createElement('option');option.value=key;option.textContent=m.name;select.append(option);}
  select.value=pair.mark;select.onchange=()=>{pair.mark=select.value;render();};label.append(select);f.append(label);
  const colors=document.createElement('div');colors.className='swatches';colors.setAttribute('role','group');colors.setAttribute('aria-label',`ペア${pairLabel(i)}の色`);
  COLORS.forEach((color,n)=>{const btn=document.createElement('button');btn.className='swatch';btn.style.background=color;btn.setAttribute('aria-label',['ローズ','ブルー','グリーン','イエロー','パープル','ターコイズ','オレンジ','ブラウン'][n]);btn.setAttribute('aria-pressed',pair.color===color);btn.onclick=()=>{pair.color=color;controls();render();};colors.append(btn);});f.append(colors);host.append(f);
 });
 $('#layout').value=state.layout;$('#origin').value=state.origin;
 $('#layout').disabled=state.mode===8;$('#origin').disabled=state.mode===8;
 $('#layout-note').textContent=state.mode===4?'対・隣と基準の辺で配置を選ぶか、図の2ピースを選んで組み替えます。':state.mode===6?'選んだ2辺を分割し、それぞれの辺に独立したペアを作ります。残りの2辺はもう1組です。':'4辺それぞれの2区間がペアA〜Dになります。';
 $('#backs').replaceChildren();
 active.forEach(piece=>{
  const label=document.createElement('label');label.className='check';const input=document.createElement('input');input.type='checkbox';input.checked=state.backs[piece.index];input.id=`piece-back-${piece.index}`;
  input.onchange=()=>{state.backs[piece.index]=input.checked;render();};label.append(input,`${pieceName(piece)}（${pairLabel(piece.pair)}）を裏返す`);$('#backs').append(label);
 });
 $('#back-color').checked=state.backColor;
}
function reconfigure(options){configureSquare(state,options);selectedPiece=null;pairMessage='';controls();render();}
$('#piece-mode').onchange=e=>reconfigure({mode:Number(e.target.value)});
$('#origin').onchange=e=>reconfigure({origin:Number(e.target.value)});
$('#layout').onchange=e=>reconfigure({layout:e.target.value});$('#back-color').onchange=e=>{state.backColor=e.target.checked;render();};$('#settings-reset').onclick=()=>{state=defaults();selectedPiece=null;pairMessage='';controls();render();};$('#flip').onclick=()=>{if(selected===null)return;tiles[selected].flip=!tiles[selected].flip;render();};$('#one-reset').onclick=()=>{if(selected===null)return;Object.assign(tiles[selected],{rotation:0,flip:false});render();};$('#all-reset').onclick=()=>{tiles=initialTiles();selected=null;render();};
// Keep action/settings controls usable without clearing the selected tile.
document.addEventListener('click',event=>{
  if(event.target.closest('#board [data-tile],#preview,button,input,select,label,aside'))return;
  if(selected!==null){selected=null;render();}
});
export async function exportPNG(source,filename,size){const copy=source.cloneNode(true);copy.querySelectorAll('[data-selection],[data-editor-selection]').forEach(e=>e.remove());copy.setAttribute('width',size);copy.setAttribute('height',size);const blob=new Blob([new XMLSerializer().serializeToString(copy)],{type:'image/svg+xml;charset=utf-8'}),url=URL.createObjectURL(blob);try{const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url;});const canvas=document.createElement('canvas');canvas.width=canvas.height=size;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,size,size);ctx.drawImage(img,0,0,size,size);const png=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!png)throw Error('PNGを作成できませんでした');const link=document.createElement('a'),download=URL.createObjectURL(png);link.href=download;link.download=filename;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(download),10000);return png;}finally{URL.revokeObjectURL(url);}}
for(const [id,target,name,size]of [['save-tile','preview','tile.png',1800],['save-board','board','tiling.png',3200]])$("#"+id).onclick=async()=>{try{await exportPNG($("#"+target+' svg'),name.replace('.png',`-${pieces(state).length}pieces.png`),size);$('#export-status').textContent='PNG画像を保存しました。';}catch(error){$('#export-status').textContent='保存できませんでした。もう一度お試しください。';console.error(error);}};
controls();render();
