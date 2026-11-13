// Viewport coordinates. Prefer the right of the tile; keep the complete touch
// target inside the visible board/viewport, falling back to left/below/above.
export function placeFlipButton(tile,bounds,size,gap=6){
 const candidates=[
  {side:'right',left:tile.right+gap,top:Math.max(bounds.top,tile.top-size.height/2)},
  {side:'left',left:tile.left-size.width-gap,top:Math.max(bounds.top,tile.top-size.height/2)},
  {side:'below',left:tile.left,top:tile.bottom+gap},
  {side:'above',left:tile.left,top:tile.top-size.height-gap}
 ];
 const fits=p=>p.left>=bounds.left&&p.top>=bounds.top&&p.left+size.width<=bounds.right&&p.top+size.height<=bounds.bottom;
 const fit=candidates.find(fits);
 if(fit)return fit;
 const clamp=(value,min,max)=>Math.max(min,Math.min(value,Math.max(min,max)));
 return {side:'clamped',left:clamp(candidates[0].left,bounds.left,bounds.right-size.width),top:clamp(candidates[0].top,bounds.top,bounds.bottom-size.height)};
}
