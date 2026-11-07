// Indicators are per shared boundary (not per tile or per half-interval).
export function mismatchWarnings(results,visible=true){
 if(!visible)return [];
 const seen=new Set();
 return results.filter(r=>!r.match).flatMap(r=>{
  const [start,end]=r.a.ends;
  const key=[start.join(','),end.join(',')].sort().join('|');
  if(seen.has(key))return [];seen.add(key);
  const length=Math.hypot(end[0]-start[0],end[1]-start[1]);
  return [{start,end,center:[(start[0]+end[0])/2,(start[1]+end[1])/2],width:length*.03,radius:length*.045}];
 });
}
export function appendMismatchLayer(svg,results,visible,el){
 const layer=el('g',{'data-mismatch-layer':'true','pointer-events':'none','aria-hidden':'true'});
 for(const warning of mismatchWarnings(results,visible)){
  const {start,end,center,width,radius}=warning;
  const group=el('g',{'data-mismatch':'true'});
  group.append(el('path',{d:`M${start} L${end}`,fill:'none',stroke:'#F0243E','stroke-width':width,'stroke-linecap':'round','data-mismatch-line':'true'}));
  for(const [cx,cy] of [start,end])group.append(el('circle',{cx,cy,r:width*.55,fill:'#F0243E',stroke:'#fff','stroke-width':width*.18}));
  group.append(el('circle',{cx:center[0],cy:center[1],r:radius,fill:'#fff',stroke:'#F0243E','stroke-width':width*.25}));
  group.append(el('text',{x:center[0],y:center[1],'text-anchor':'middle','dominant-baseline':'central','font-family':'sans-serif','font-size':radius*1.9,'font-weight':700,fill:'#F0243E'},'×'));
  layer.append(group);
 }
 svg.append(layer);
}
