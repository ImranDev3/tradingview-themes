// ---------- chart drawing (shared) ----------
const NS='http://www.w3.org/2000/svg';

function drawChart(svg,t,W,H,axis){
  while(svg.firstChild)svg.removeChild(svg.firstChild);
  const el=(tag,at)=>{const e=document.createElementNS(NS,tag);for(const k in at)e.setAttribute(k,at[k]);svg.appendChild(e);return e};
  svg.style.background=t.bg;
  // Realistic TradingView look: right price scale + bottom date scale, no volume,
  // hollow/dark-bordered candles, current price highlighted on the scale.
  const mono='JetBrains Mono, monospace';
  const padL=axis?10:6, padT=axis?8:6, scW=axis?56:46, scH=axis?20:14;
  const cw2=W-padL-scW, ch2=H-padT-scH;
  const yMin=Math.min(...CND.map(k=>k.lo)), yMax=Math.max(...CND.map(k=>k.hi));
  const span=(yMax-yMin)||1;
  const Y=p=>padT+(1-(p-yMin)/span)*(ch2-8);
  // fewer chunkier candles so bodies/borders read clearly on small previews
  const step=Math.max(1,Math.round(CND.length/(axis?CND.length:26)));
  const shown=CND.filter((_,i)=>i%step===0);
  const cw=(cw2-padL)/shown.length;
  // border between chart area and scales (faint frame, TradingView style)
  el('line',{x1:cw2+padL,y1:0,x2:cw2+padL,y2:ch2+padT,stroke:t.grid,'stroke-width':1});
  el('line',{x1:0,y1:ch2+padT,x2:W,y2:ch2+padT,stroke:t.grid,'stroke-width':1});
  // candles — thin wick + solid body with darker border
  shown.forEach((k,i)=>{
    const x=padL+i*cw, up=k.c>=k.o, col=up?t.up:t.dn, bcol=up?t.upB:t.dnB;
    const cx=x+cw/2;
    el('line',{x1:cx,y1:Y(k.hi),x2:cx,y2:Y(k.lo),stroke:bcol,'stroke-width':Math.max(0.9,cw*0.09)});
    const bw=Math.max(2.5,cw*0.6), by=Y(Math.max(k.o,k.c)), bh=Math.max(2,Math.abs(Y(k.o)-Y(k.c)));
    el('rect',{x:cx-bw/2,y:by,width:bw,height:bh,fill:col,stroke:bcol,'stroke-width':Math.max(0.7,cw*0.08),rx:0.5});
  });
  // price scale labels (right)
  const rows=axis?6:5, base=67000;
  const lvls=[];for(let i=0;i<rows;i++){const p=yMin+span*i/(rows-1);lvls.push({p,v:Math.round(base+(p-0.5)*900)})}
  lvls.forEach(L=>{
    const y=Y(L.p);
    if(axis)el('line',{x1:cw2+padL,y1:y,x2:cw2+padL+4,y2:y,stroke:t.text,'stroke-width':1,opacity:0.5});
    const tx=el('text',{x:cw2+padL+(axis?7:5),y:y+3,fill:t.text,'font-size':axis?11:9,'font-family':mono});
    tx.textContent=L.v.toLocaleString()+'.00';
  });
  // date scale labels (bottom) — TradingView daily style
  const dates=axis?['3','10','17','24','Feb','8','15']:['3','10','17','Feb','15'];
  dates.forEach((d,i)=>{
    const x=padL+cw2*(i+0.5)/(dates.length);
    if(axis)el('line',{x1:x,y1:ch2+padT,x2:x,y2:ch2+padT+4,stroke:t.text,'stroke-width':1,opacity:0.5});
    const tx=el('text',{x:x,y:ch2+padT+(axis?15:11),fill:t.text,'font-size':axis?11:8.5,'font-family':mono,'text-anchor':'middle'});
    tx.textContent=d;
  });
  // current price highlight on the scale (last close)
  const lastC=shown[shown.length-1].c, lastY=Y(lastC);
  const up=shown[shown.length-1].c>=shown[shown.length-1].o;
  const pc=up?t.up:t.dn;
  el('line',{x1:0,y1:lastY,x2:cw2+padL,y2:lastY,stroke:pc,'stroke-width':1,'stroke-dasharray':'3 3',opacity:0.8});
  el('rect',{x:cw2+padL+1,y:lastY-(axis?9:7),width:scW-2,height:axis?18:14,rx:3,fill:pc});
  const tt=el('text',{x:cw2+padL+(axis?7:5),y:lastY+(axis?3.5:3),fill:t.bg,'font-size':axis?10.5:8.5,'font-weight':'600','font-family':mono});
  tt.textContent=(Math.round(67000+(lastC-0.5)*900)).toLocaleString();
}

// ---------- chart drawing (static, reference-style) ----------
const NS2='http://www.w3.org/2000/svg';
let _seed=42; const _rnd=()=>{_seed=(_seed*9301+49297)%233280;return _seed/233280};
function mkCandles(){_seed=42;const N=42;let p=0.5,out=[];
  for(let i=0;i<N;i++){const d=(_rnd()-0.47)*0.09;const o=p,c=Math.min(0.97,Math.max(0.03,o+d));
  const hi=Math.max(o,c)+_rnd()*0.035,lo=Math.min(o,c)-_rnd()*0.035,v=0.25+_rnd()*0.75;out.push({o,c,hi,lo,v});p=c}return out}
const CND=mkCandles();

function drawChart(svg,t,W,H,axis){
  while(svg.firstChild)svg.removeChild(svg.firstChild);
  const el=(tag,at)=>{const e=document.createElementNS(NS2,tag);for(const k in at)e.setAttribute(k,at[k]);svg.appendChild(e);return e};
  svg.style.background=t.bg;
  const mono='JetBrains Mono, monospace';
  const padL=axis?10:6, padT=axis?8:6, scW=axis?56:46, scH=axis?20:14;
  const cw2=W-padL-scW, ch2=H-padT-scH;
  const yMin=Math.min(...CND.map(k=>k.lo)), yMax=Math.max(...CND.map(k=>k.hi));
  const span=(yMax-yMin)||1;
  const Y=p=>padT+(1-(p-yMin)/span)*(ch2-8);
  const step=Math.max(1,Math.round(CND.length/(axis?CND.length:26)));
  const shown=CND.filter((_,i)=>i%step===0);
  const cw=(cw2-padL)/shown.length;
  el('line',{x1:cw2+padL,y1:0,x2:cw2+padL,y2:ch2+padT,stroke:t.grid,'stroke-width':1});
  el('line',{x1:0,y1:ch2+padT,x2:W,y2:ch2+padT,stroke:t.grid,'stroke-width':1});
  shown.forEach((k,i)=>{
    const x=padL+i*cw, up=k.c>=k.o, col=up?t.up:t.dn, bcol=up?t.upB:t.dnB;
    const cx=x+cw/2;
    el('line',{x1:cx,y1:Y(k.hi),x2:cx,y2:Y(k.lo),stroke:bcol,'stroke-width':Math.max(0.9,cw*0.09)});
    const bw=Math.max(2.5,cw*0.6), by=Y(Math.max(k.o,k.c)), bh=Math.max(2,Math.abs(Y(k.o)-Y(k.c)));
    el('rect',{x:cx-bw/2,y:by,width:bw,height:bh,fill:col,stroke:bcol,'stroke-width':Math.max(0.7,cw*0.08),rx:0.5});
  });
  const rows=axis?6:5, base=67000;
  for(let i=0;i<rows;i++){
    const p=yMin+span*i/(rows-1), y=Y(p);
    if(axis)el('line',{x1:cw2+padL,y1:y,x2:cw2+padL+4,y2:y,stroke:t.text,'stroke-width':1,opacity:0.5});
    const tx=el('text',{x:cw2+padL+(axis?7:5),y:y+3,fill:t.text,'font-size':axis?11:9,'font-family':mono});
    tx.textContent=(Math.round(base+(p-0.5)*900)).toLocaleString()+'.00';
  }
  const dates=axis?['3','10','17','24','Feb','8','15']:['3','10','17','Feb','15'];
  dates.forEach((d,i)=>{
    const x=padL+cw2*(i+0.5)/(dates.length);
    if(axis)el('line',{x1:x,y1:ch2+padT,x2:x,y2:ch2+padT+4,stroke:t.text,'stroke-width':1,opacity:0.5});
    const tx=el('text',{x:x,y:ch2+padT+(axis?15:11),fill:t.text,'font-size':axis?11:8.5,'font-family':mono,'text-anchor':'middle'});
    tx.textContent=d;
  });
  const lastC=shown[shown.length-1].c, lastY=Y(lastC);
  const up=shown[shown.length-1].c>=shown[shown.length-1].o;
  const pc=up?t.up:t.dn;
  el('line',{x1:0,y1:lastY,x2:cw2+padL,y2:lastY,stroke:pc,'stroke-width':1,'stroke-dasharray':'3 3',opacity:0.8});
  el('rect',{x:cw2+padL+1,y:lastY-(axis?9:7),width:scW-2,height:axis?18:14,rx:3,fill:pc});
  const tt=el('text',{x:cw2+padL+(axis?7:5),y:lastY+(axis?3.5:3),fill:t.bg,'font-size':axis?10.5:8.5,'font-weight':'600','font-family':mono});
  tt.textContent=(Math.round(67000+(lastC-0.5)*900)).toLocaleString();
}

// ---------- interactive variant (detail page only): same look + drag-pan + crosshair ----------
// Uses the SAME drawing style as drawChart, but on an extended candle set so
// users can drag to scroll back and forth like TradingView.
function drawChartInteractive(svg,t,W,H){
  const N=90; _seed=99; // extended series, same generator => same look
  let p=0.5, big=[];
  for(let i=0;i<N;i++){const d=(_rnd()-0.47)*0.09;const o=p,c=Math.min(0.97,Math.max(0.03,o+d));
    const hi=Math.max(o,c)+_rnd()*0.035,lo=Math.min(o,c)-_rnd()*0.035,v=0.25+_rnd()*0.75;big.push({o,c,hi,lo,v});p=c}
  const mono='JetBrains Mono, monospace';
  const padL=10, padT=8, scW=56, scH=20;
  const cw2=W-padL-scW, ch2=H-padT-scH;
  const shown=42, cw=(cw2-padL)/shown;
  let start=big.length-shown;
  svg.style.background=t.bg; svg.style.cursor='crosshair'; svg.style.touchAction='none';
  while(svg.firstChild)svg.removeChild(svg.firstChild);
  const frame=mkEl(svg,'g',{}), candlesG=mkEl(svg,'g',{}), scaleG=mkEl(svg,'g',{}), priceG=mkEl(svg,'g',{});
  mkEl(frame,'line',{x1:cw2+padL,y1:0,x2:cw2+padL,y2:ch2+padT,stroke:t.grid,'stroke-width':1});
  mkEl(frame,'line',{x1:0,y1:ch2+padT,x2:W,y2:ch2+padT,stroke:t.grid,'stroke-width':1});
  const crossG=mkEl(svg,'g',{}); crossG.style.display='none';
  const vline=mkEl(crossG,'line',{y1:0,y2:ch2+padT,stroke:t.text,'stroke-width':1,'stroke-dasharray':'4 3',opacity:0.85});
  const hline=mkEl(crossG,'line',{x1:0,x2:cw2+padL,stroke:t.text,'stroke-width':1,'stroke-dasharray':'4 3',opacity:0.85});
  const ylab=mkEl(crossG,'rect',{width:scW-2,height:17,rx:3,fill:t.text});
  const ylabT=mkEl(crossG,'text',{fill:t.bg,'font-size':10,'font-weight':'600','font-family':mono});
  const xlab=mkEl(crossG,'rect',{width:36,height:15,rx:3,fill:t.text});
  const xlabT=mkEl(crossG,'text',{fill:t.bg,'font-size':9,'font-weight':'600','font-family':mono,'text-anchor':'middle'});
  const ohlc=mkEl(svg,'text',{x:padL+6,y:18,fill:t.text,'font-size':11.5,'font-family':mono});

  function render(){
    start=Math.max(0,Math.min(big.length-shown,Math.round(start)));
    const slice=big.slice(start,start+shown);
    let mn=Infinity,mx=-Infinity; slice.forEach(k=>{mn=Math.min(mn,k.lo);mx=Math.max(mx,k.hi)});
    const pad=(mx-mn)*0.09||1; mn-=pad; mx+=pad;
    const span=(mx-mn)||1, Y=p2=>padT+(1-(p2-mn)/span)*(ch2-8);
    candlesG.innerHTML='';
    slice.forEach((k,i)=>{
      const x=padL+i*cw, up=k.c>=k.o, col=up?t.up:t.dn, bcol=up?t.upB:t.dnB, cx=x+cw/2;
      mkEl(candlesG,'line',{x1:cx,y1:Y(k.hi),x2:cx,y2:Y(k.lo),stroke:bcol,'stroke-width':Math.max(0.9,cw*0.09)});
      const bw=Math.max(2.5,cw*0.6),by=Y(Math.max(k.o,k.c)),bh=Math.max(2,Math.abs(Y(k.o)-Y(k.c)));
      mkEl(candlesG,'rect',{x:cx-bw/2,y:by,width:bw,height:bh,fill:col,stroke:bcol,'stroke-width':Math.max(0.7,cw*0.08),rx:0.5});
    });
    scaleG.innerHTML='';
    const base=67000, rows=6;
    for(let i=0;i<rows;i++){
      const p2=mn+span*i/(rows-1), y=Y(p2);
      mkEl(scaleG,'line',{x1:cw2+padL,y1:y,x2:cw2+padL+4,y2:y,stroke:t.text,'stroke-width':1,opacity:0.5});
      const tx=mkEl(scaleG,'text',{x:cw2+padL+7,y:y+3,fill:t.text,'font-size':11,'font-family':mono});
      tx.textContent=(Math.round(base+(p2-0.5)*900)).toLocaleString()+'.00';
    }
    const dates=['3','10','17','24','Feb','8','15'];
    dates.forEach((d,i)=>{
      const x=padL+cw2*(i+0.5)/dates.length;
      mkEl(scaleG,'line',{x1:x,y1:ch2+padT,x2:x,y2:ch2+padT+4,stroke:t.text,'stroke-width':1,opacity:0.5});
      const tx=mkEl(scaleG,'text',{x:x,y:ch2+padT+15,fill:t.text,'font-size':11,'font-family':mono,'text-anchor':'middle'});
      tx.textContent=d;
    });
    priceG.innerHTML='';
    const last=big[big.length-1], up=last.c>=last.o, pc=up?t.up:t.dn;
    if(last.c>mn&&last.c<mx){
      const ly=Y(last.c);
      mkEl(priceG,'line',{x1:0,y1:ly,x2:cw2+padL,y2:ly,stroke:pc,'stroke-width':1,'stroke-dasharray':'3 3',opacity:0.8});
      mkEl(priceG,'rect',{x:cw2+padL+1,y:ly-9,width:scW-2,height:18,rx:3,fill:pc});
      const tt=mkEl(priceG,'text',{x:cw2+padL+7,y:ly+3.5,fill:t.bg,'font-size':10.5,'font-weight':'600','font-family':mono});
      tt.textContent=(Math.round(67000+(last.c-0.5)*900)).toLocaleString();
    }
    return {slice,mn,span,Y};
  }

  let st=null;
  const pos=e=>{const r=svg.getBoundingClientRect();return {x:(e.clientX-r.left)*(W/r.width),y:(e.clientY-r.top)*(H/r.height)}};
  svg.addEventListener('pointerdown',e=>{st={x:e.clientX,start};svg.setPointerCapture(e.pointerId);svg.style.cursor='grabbing'});
  svg.addEventListener('pointermove',e=>{
    if(st){start=st.start+(st.x-e.clientX)/cw;render();return}
    const p2=pos(e);
    if(p2.x>cw2+padL||p2.y>ch2+padT){crossG.style.display='none';ohlc.textContent='';return}
    const {slice,mn,span,Y}=render();
    const i=Math.max(0,Math.min(slice.length-1,Math.round((p2.x-padL)/cw-0.5)));
    const k=slice[i], cx=padL+i*cw+cw/2, cy=Math.max(8,Math.min(ch2+padT-8,p2.y));
    crossG.style.display='block';
    vline.setAttribute('x1',cx);vline.setAttribute('x2',cx);
    hline.setAttribute('y1',cy);hline.setAttribute('y2',cy);
    const pv=mn+span*(1-(cy-padT)/(ch2-8));
    ylab.setAttribute('x',cw2+padL+1);ylab.setAttribute('y',cy-8);
    ylabT.setAttribute('x',cw2+padL+6);ylabT.setAttribute('y',cy+3.5);ylabT.textContent=(Math.round(67000+(pv-0.5)*900)).toLocaleString();
    xlab.setAttribute('x',cx-18);xlab.setAttribute('y',ch2+padT+3);
    xlabT.setAttribute('x',cx);xlabT.setAttribute('y',ch2+padT+14);xlabT.textContent='Feb '+(1+((start+i)%28));
    const up=k.c>=k.o, ch=((k.c-k.o)/k.o*100);
    const f=v=>(67000+(v-0.5)*900).toLocaleString(undefined,{maximumFractionDigits:0});
    ohlc.textContent=`O ${f(k.o)}  H ${f(k.hi)}  L ${f(k.lo)}  C ${f(k.c)}  ${ch>=0?'+':''}${ch.toFixed(2)}%`;
    ohlc.setAttribute('fill',up?t.up:t.dn);
  });
  const end=()=>{st=null;svg.style.cursor='crosshair'};
  svg.addEventListener('pointerup',end);
  svg.addEventListener('pointerleave',()=>{end();crossG.style.display='none';ohlc.textContent=''});
  render();
}

// ---------- realistic chart data (deterministic random walk with trends) ----------
function mkSeries(n){
  let seed=7; const rnd=()=>{seed=(seed*9301+49297)%233280;return seed/233280};
  let p=104, out=[];
  for(let i=0;i<n;i++){
    const trend=Math.sin(i/11)*0.011+Math.sin(i/29+1.5)*0.008;
    const drift=trend+(rnd()-0.485)*0.028;
    const o=p, c=o*(1+drift);
    const hi=Math.max(o,c)*(1+rnd()*0.012), lo=Math.min(o,c)*(1-rnd()*0.012);
    out.push({o,c,hi,lo}); p=c;
  }
  return out;
}
const SERIES=mkSeries(260);
const fmtP=v=>v.toFixed(2);
const mkEl=(par,tag,at)=>{const e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const k in at)e.setAttribute(k,at[k]);par.appendChild(e);return e};

// ---------- INTERACTIVE CHART ENGINE (TradingView-like) ----------
// Renders SERIES into svg with theme t. opts: {H, compact (small card),
// interactive (drag-pan + crosshair + OHLC), axis (bigger scales)}.
// Returns api.render()
function makeChart(svg,t,opts){
  const W=400, H=opts.H;
  svg.setAttribute('viewBox','0 0 '+W+' '+H);
  svg.setAttribute('preserveAspectRatio','none');
  svg.style.background=t.bg;
  svg.style.display='block';svg.style.width='100%';svg.style.height=H+'px';
  const compact=opts.compact, axis=opts.axis;
  const mono='JetBrains Mono, monospace';
  const scW=axis?56:44, scH=axis?20:15, padL=axis?8:4, padT=axis?8:5;
  const cw2=W-padL-scW, ch2=H-padT-scH;
  const cw=compact?7.2:(axis?5.4:7.2);
  const shown=Math.max(8,Math.floor(cw2/cw));
  let start=SERIES.length-shown;
  const S={}; // named layers

  // static frame (scales + separator lines) — drawn once
  const frame=document.createElementNS('http://www.w3.org/2000/svg','g');svg.appendChild(frame);
  // scale ticks + date labels depend on start → drawn in render() instead.
  mkEl(frame,'line',{x1:cw2+padL,y1:0,x2:cw2+padL,y2:ch2+padT,stroke:t.grid,'stroke-width':1});
  mkEl(frame,'line',{x1:0,y1:ch2+padT,x2:W,y2:ch2+padT,stroke:t.grid,'stroke-width':1});

  const candlesG=document.createElementNS('http://www.w3.org/2000/svg','g');svg.appendChild(candlesG);
  const scaleG=document.createElementNS('http://www.w3.org/2000/svg','g');svg.appendChild(scaleG);
  const priceG=document.createElementNS('http://www.w3.org/2000/svg','g');svg.appendChild(priceG);
  let crossG=null, ohlc=null;
  if(opts.interactive){
    crossG=document.createElementNS('http://www.w3.org/2000/svg','g');crossG.style.display='none';svg.appendChild(crossG);
    S.vline=mkEl(crossG,'line',{y1:0,y2:ch2+padT,stroke:t.text,'stroke-width':1,'stroke-dasharray':'4 3',opacity:0.85});
    S.hline=mkEl(crossG,'line',{x1:0,x2:cw2+padL,stroke:t.text,'stroke-width':1,'stroke-dasharray':'4 3',opacity:0.85});
    S.ylab=mkEl(crossG,'rect',{width:scW-2,height:14,rx:3,fill:t.text});
    S.ylabT=mkEl(crossG,'text',{fill:t.bg,'font-size':8.5,'font-weight':'600','font-family':mono});
    S.xlab=mkEl(crossG,'rect',{width:34,height:13,rx:3,fill:t.text});
    S.xlabT=mkEl(crossG,'text',{fill:t.bg,'font-size':8,'font-weight':'600','font-family':mono,'text-anchor':'middle'});
    ohlc=mkEl(svg,'text',{x:padL+4,y:axis?16:13,fill:t.text,'font-size':axis?11:9.5,'font-family':mono});
  }

  function visRange(){
    const s=Math.max(0,Math.min(SERIES.length-shown,Math.round(start)));
    const slice=SERIES.slice(s,s+shown);
    let mn=Infinity,mx=-Infinity;
    slice.forEach(k=>{mn=Math.min(mn,k.lo);mx=Math.max(mx,k.hi)});
    const pad=(mx-mn)*0.09||1; return {s,slice,mn:mn-pad,mx:mx+pad};
  }

  function render(){
    const {s,slice,mn,mx}=visRange();
    const span=(mx-mn)||1;
    const Y=p=>padT+(1-(p-mn)/span)*(ch2-6);
    // candles
    candlesG.innerHTML='';
    slice.forEach((k,i)=>{
      const x=padL+i*cw, up=k.c>=k.o, col=up?t.up:t.dn, bcol=up?t.upB:t.dnB;
      const cx=x+cw/2;
      mkEl(candlesG,'line',{x1:cx,y1:Y(k.hi),x2:cx,y2:Y(k.lo),stroke:bcol,'stroke-width':Math.max(0.9,cw*0.11)});
      const bw=Math.max(2.5,cw*0.6),by=Y(Math.max(k.o,k.c)),bh=Math.max(1.6,Math.abs(Y(k.o)-Y(k.c)));
      mkEl(candlesG,'rect',{x:cx-bw/2,y:by,width:bw,height:bh,fill:col,stroke:bcol,'stroke-width':Math.max(0.7,cw*0.08),rx:0.5});
    });
    // price scale labels
    scaleG.innerHTML='';
    const rows=axis?6:5;
    for(let i=0;i<rows;i++){
      const p=mn+span*i/(rows-1), y=Y(p);
      if(axis)mkEl(scaleG,'line',{x1:cw2+padL,y1:y,x2:cw2+padL+4,y2:y,stroke:t.text,'stroke-width':1,opacity:0.5});
      const tx=mkEl(scaleG,'text',{x:cw2+padL+(axis?7:5),y:y+3,fill:t.text,'font-size':axis?10.5:8.5,'font-family':mono});
      tx.textContent=fmtP(p);
    }
    // date labels — map series index → dates like reference (13, 20, 27, Feb, 6, 13, 20)
    const dmarks=axis?['13','20','27','Feb','6','13','20']:['13','27','Feb','13'];
    dmarks.forEach((d,i)=>{
      const x=padL+cw2*(i+0.5)/dmarks.length;
      if(axis)mkEl(scaleG,'line',{x1:x,y1:ch2+padT,x2:x,y2:ch2+padT+4,stroke:t.text,'stroke-width':1,opacity:0.5});
      const tx=mkEl(scaleG,'text',{x:x,y:ch2+padT+(axis?15:11),fill:t.text,'font-size':axis?10.5:8.5,'font-family':mono,'text-anchor':'middle'});
      tx.textContent=d;
    });
    // current price line + scale highlight (last candle of FULL series)
    const last=SERIES[SERIES.length-1], up=last.c>=last.o, pc=up?t.up:t.dn;
    priceG.innerHTML='';
    if(last.c>mn&&last.c<mx){
      const ly=Y(last.c);
      mkEl(priceG,'line',{x1:0,y1:ly,x2:cw2+padL,y2:ly,stroke:pc,'stroke-width':1,'stroke-dasharray':'3 3',opacity:0.8});
      mkEl(priceG,'rect',{x:cw2+padL+1,y:ly-(axis?9:7),width:scW-2,height:axis?17:14,rx:3,fill:pc});
      const tt=mkEl(priceG,'text',{x:cw2+padL+(axis?7:5),y:ly+(axis?3.5:3),fill:t.bg,'font-size':axis?10:8.5,'font-weight':'600','font-family':mono});
      tt.textContent=fmtP(last.c);
    }
    return {s,slice,mn,mx,span,Y};
  }

  // interactivity: drag to pan + hover crosshair + OHLC readout
  if(opts.interactive){
    let st=null;
    const pos=e=>{const r=svg.getBoundingClientRect();return {x:(e.clientX-r.left)*(W/r.width),y:(e.clientY-r.top)*(H/r.height)}};
    svg.style.cursor='crosshair';svg.style.touchAction='none';
    svg.addEventListener('pointerdown',e=>{st={x:e.clientX,start};svg.setPointerCapture(e.pointerId);svg.style.cursor='grabbing'});
    svg.addEventListener('pointermove',e=>{
      if(st){start=st.start+(st.x-e.clientX)/cw;render();return}
      const p=pos(e);
      if(p.x>cw2+padL||p.y>ch2+padT){crossG.style.display='none';if(ohlc)ohlc.textContent='';return}
      const {s,slice,mn,mx,span,Y}=render();
      const i=Math.max(0,Math.min(slice.length-1,Math.round((p.x-padL)/cw-0.5)));
      const k=slice[i], cx=padL+i*cw+cw/2, cy=Math.max(8,Math.min(ch2+padT-8,p.y));
      crossG.style.display='block';
      S.vline.setAttribute('x1',cx);S.vline.setAttribute('x2',cx);
      S.hline.setAttribute('y1',cy);S.hline.setAttribute('y2',cy);
      const pv=mn+span*(1-(cy-padT)/(ch2-6));
      S.ylab.setAttribute('x',cw2+padL+1);S.ylab.setAttribute('y',cy-7);
      S.ylabT.setAttribute('x',cw2+padL+5);S.ylabT.setAttribute('y',cy+3);S.ylabT.textContent=fmtP(pv);
      S.xlab.setAttribute('x',cx-17);S.xlab.setAttribute('y',ch2+padT+2);
      S.xlabT.setAttribute('x',cx);S.xlabT.setAttribute('y',ch2+padT+11);S.xlabT.textContent='D '+(s+i);
      if(ohlc){
        const up=k.c>=k.o,col=up?t.up:t.dn,ch=((k.c-k.o)/k.o*100);
        ohlc.textContent=`O ${fmtP(k.o)}  H ${fmtP(k.hi)}  L ${fmtP(k.lo)}  C ${fmtP(k.c)}  ${ch>=0?'+':''}${ch.toFixed(2)}%`;
        ohlc.setAttribute('fill',col);
      }
    });
    const end=()=>{st=null;svg.style.cursor='crosshair'};
    svg.addEventListener('pointerup',end);
    svg.addEventListener('pointerleave',()=>{end();crossG.style.display='none';if(ohlc)ohlc.textContent=''});
  }
  return {render};
}

// ---------- render cards ----------
const grid=document.getElementById('grid'), catbar=document.getElementById('catbar'),
      emptyEl=document.getElementById('empty'), searchEl=document.getElementById('search'),
      detailEl=document.getElementById('detail'),
      toastEl=document.getElementById('toast'), toastMsg=document.getElementById('toastmsg');
let toastTimer=null;
function showToast(hex,count){
  clearTimeout(toastTimer);
  toastMsg.innerHTML = count
    ? `<span class="thex">${count} colors</span> copied to clipboard!`
    : `<span class="thex">${hex}</span> copied!`;
  toastEl.classList.add('show');
  toastTimer=setTimeout(()=>toastEl.classList.remove('show'),2000);
}
// GLOBAL auto-copy: any element with data-hex, anywhere on the page,
// now and for every theme added in the future (event delegation).
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-hex]');
  if(!b)return;
  const hex=b.dataset.hex;
  const done=()=>{
    showToast(hex);
    // 1) floating "✓ Copied" bubble beside the chip
    const old=b.querySelector('.copypop');
    if(old)old.remove();
    const pop=document.createElement('span');
    pop.className='copypop';pop.textContent='✓ Copied';
    b.appendChild(pop);
    requestAnimationFrame(()=>pop.classList.add('show'));
    setTimeout(()=>{pop.classList.remove('show');setTimeout(()=>pop.remove(),250)},1600);
    // 2) chip itself flashes green
    const h=b.querySelector('.hex');
    if(h){h.classList.remove('flash');void h.offsetWidth;h.classList.add('flash')}
  };
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(hex).then(done).catch(()=>{fallbackCopy(hex);done()});
  }else{fallbackCopy(hex);done()}
});
function fallbackCopy(text){
  const ta=document.createElement('textarea');
  ta.value=text;ta.style.position='fixed';ta.style.opacity='0';
  document.body.appendChild(ta);ta.select();
  try{document.execCommand('copy')}catch(e){}
  document.body.removeChild(ta);
}
let activeCat='all', query='';
// ---------- favorites (localStorage) ----------
let FAVS=[]; try{FAVS=JSON.parse(localStorage.getItem('chartskins-favs')||'[]')}catch(e){FAVS=[]}
const isFav=id=>FAVS.includes(id);
function toggleFav(id){
  if(isFav(id))FAVS=FAVS.filter(x=>x!==id); else FAVS.push(id);
  try{localStorage.setItem('chartskins-favs',JSON.stringify(FAVS))}catch(e){}
  renderCatbar();renderGrid();
  const lg=document.getElementById('favstar-lg');
  if(lg)lg.classList.toggle('faved',isFav(id));
}

function catCounts(){const c={all:THEMES.length,fav:FAVS.length};THEMES.forEach(t=>c[t.cat]=(c[t.cat]||0)+1);return c}
function renderCatbar(){
  const cnt=catCounts();catbar.innerHTML='';
  const favB=document.createElement('button');
  favB.className='catbtn'+(activeCat==='fav'?' active':'');
  favB.innerHTML=`<span>⭐</span><span>Favorites</span><span class="cnt">${cnt.fav}</span>`;
  favB.onclick=()=>{activeCat='fav';renderCatbar();renderGrid()};
  catbar.appendChild(favB);
  Object.keys(CATS).forEach(k=>{
    if(k==='all')return;
    const b=document.createElement('button');
    b.className='catbtn'+(k===activeCat?' active':'');
    b.innerHTML=`<span>${CATS[k].icon}</span><span class="bn">${CATS[k].label}</span><span class="cnt">${cnt[k]||0}</span>`;
    b.onclick=()=>{activeCat=k;renderCatbar();renderGrid()};
    catbar.appendChild(b);
  });
  const allB=document.createElement('button');
  allB.className='catbtn'+(activeCat==='all'?' active':'');
  allB.innerHTML=`<span>${CATS.all.icon}</span><span class="bn">${CATS.all.label}</span><span class="cnt">${cnt.all}</span>`;
  allB.onclick=()=>{activeCat='all';renderCatbar();renderGrid()};
  catbar.insertBefore(allB,catbar.children[1]||null);
}
function renderGrid(){
  grid.innerHTML='';
  const list=THEMES.filter(t=>(activeCat==='all'||activeCat==='fav'?true:t.cat===activeCat)&&(activeCat==='fav'?isFav(t.id):true)&&(!query||t.name.toLowerCase().includes(query)||CATS[t.cat].en.toLowerCase().includes(query)));
  emptyEl.style.display=list.length?'none':'block';
  if(activeCat==='fav'&&!list.length)emptyEl.querySelector('p').textContent='No favorites yet — hit the ⭐ on any theme card';
  else emptyEl.querySelector('p').textContent='No themes found — try another name';
  list.forEach(t=>{
    const card=document.createElement('div');card.className='tcard';
    // header row: bold display name + Copy colors button (chartthemes.com layout)
    const head=document.createElement('div');head.className='cardhead';
    head.innerHTML=`<h3>${t.name}</h3>`;
    const cbtn=document.createElement('button');cbtn.className='copybtn';cbtn.textContent='Copy colors';
    cbtn.onclick=(e)=>{
      e.stopPropagation();
      const lines=[`TradingView Theme — "${t.name}" (${CATS[t.cat].en})`,'='.repeat(40),'',
        'Background: '+t.bg,'Grid: '+t.grid,'Scale Text: '+t.text,'Last Price Line: '+t.accent,'',
        'Body Up: '+t.up,'Border Up: '+t.upB,'Wick Up: '+t.up,
        'Body Down: '+t.dn,'Border Down: '+t.dnB,'Wick Down: '+t.dn,'',
        'Volume Up (opacity '+Math.round(t.vol*100)+'%): '+t.up,'Volume Down (opacity '+Math.round(t.vol*100)+'%): '+t.dn,'',
        'Bearish Zone / SL — Border: '+t.tools.rectB,'Bearish Zone / SL — BG (opacity '+t.tools.rectOp+'): '+t.tools.rectBG,
        'Bullish Zone / TP — Border: '+t.upB,'Bullish Zone / TP — BG (opacity '+t.tools.rectOp+'): '+t.up,
        'CRT High/Low + Key Level (dotted): '+t.tools.line,'Fib / Trend Line: '+t.tools.fib];
      navigator.clipboard.writeText(lines.join('\n')).then(()=>{
        showToast(null,21);
        cbtn.textContent='✓ Copied';cbtn.classList.add('done');
        setTimeout(()=>{cbtn.textContent='Copy colors';cbtn.classList.remove('done')},2000);
      });
    };
    head.appendChild(cbtn);
    card.appendChild(head);
    // big realistic chart preview
    const wrap=document.createElement('div');wrap.className='prevwrap';
    wrap.style.position='relative';
    const svg=document.createElementNS(NS,'svg');
    wrap.appendChild(svg);card.appendChild(wrap);
    svg.setAttribute('viewBox','0 0 400 215');svg.classList.add('prev');svg.setAttribute('preserveAspectRatio','none');
    drawChart(svg,t,400,215,false);
    wrap.onclick=()=>openModal(t);
    const star=document.createElement('button');
    star.className='starbtn'+(isFav(t.id)?' faved':'');
    star.innerHTML=isFav(t.id)?'★':'☆';
    star.title='Add/remove favorite';
    star.onclick=(e)=>{e.stopPropagation();toggleFav(t.id)};
    wrap.appendChild(star);
    // meta row: tag + category + palette dots
    const meta=document.createElement('div');meta.className='meta';
    meta.innerHTML=`<span class="tagpill" style="background:${t.accent}22;color:${t.accent}">${t.tag}</span><span class="catname">${CATS[t.cat].icon} ${CATS[t.cat].en}</span>
      <span class="dots">${[t.bg,t.up,t.dn,t.accent].map(c=>`<span style="background:${c}"></span>`).join('')}</span>`;
    meta.onclick=()=>openModal(t);
    card.appendChild(meta);
    grid.appendChild(card);
  });
}
searchEl.addEventListener('input',e=>{query=e.target.value.trim().toLowerCase();renderGrid()});

// ---------- theme detail page ----------
const modalbg=document.getElementById('modalbg'), modal=document.getElementById('modal');
function openModal(t){
  const rows=(arr)=>arr.map(([lab,sub,hex])=>`
    <div class="drow"><div class="lab" style="font-size:13px;color:var(--muted)">${lab}<small class="bn" style="display:block;font-size:11px;color:var(--faint)">${sub}</small></div>
    <button class="dswbtn" data-hex="${hex}" data-name="${lab}"><span class="sw" style="background:${hex}"></span><span class="hex">${hex}</span></button></div>`).join('');
  const isLight=t.cat==='light';
  const dtxt=isLight?'#22283A':'#E8EBF2';
  detailEl.innerHTML=`
    <div class="backbar">
      <button class="backbtn" id="backbtn">← Back to all themes</button>
      <div class="crumb">ChartSkins / ${CATS[t.cat].en} / <b>${t.name}</b></div>
    </div>
    <div class="dhero">
      <svg class="bchart" viewBox="0 0 1200 340" preserveAspectRatio="none"></svg>
      <div class="dtitle">
        <div class="nm" style="display:flex;align-items:center;gap:14px">${t.name}<button class="favstar-lg${isFav(t.id)?' faved':''}" id="favstar-lg" title="Add/remove favorite">${isFav(t.id)?'★':'☆'}</button></div>
        <div class="tagrow">
          <span class="tagpill" style="background:${t.accent}cc;color:#fff">${t.tag}</span>
          <span class="tagpill" style="background:rgba(10,13,18,.65);color:#fff">${CATS[t.cat].icon} ${CATS[t.cat].en}</span>
        </div>
      </div>
      <div class="chart-hint bn">🖱️ Drag to pan the chart · Hover for crosshair + OHLC</div>
    </div>

    <div class="dh2"><span class="ddot"></span>Chart Canvas</div>
    <p class="dh2sub bn">Apply in Settings → Appearance & Scales tabs</p>
    <div class="dgrid">
      <div class="dcard"><h3>Background & Grid</h3>${rows([
        ['Background','Main chart background',t.bg],
        ['Vert + Horz Grid','Nearly-invisible grid',t.grid],
        ['Scale Text','Scales tab → Text color',t.text]])}
      </div>
      <div class="dcard"><h3>Accent</h3>${rows([
        ['Last Price Line','Symbol → Price line',t.accent],
        ['Crosshair','Appearance → Crosshair',t.text],
        ['Watermark','Keep it very subtle',t.grid]])}
      </div>
    </div>

    <div class="dh2"><span class="ddot"></span>Candles — Body, Border, Wick</div>
    <p class="dh2sub bn">Apply in Settings → Symbol tab, Candles section</p>
    <div class="dgrid">
      <div class="dcard"><h3>Up Candles</h3>${rows([
        ['Body Up','Bullish candle body',t.up],
        ['Border Up','Border = darker shade',t.upB],
        ['Wick Up','Wick = body color',t.up]])}
      </div>
      <div class="dcard"><h3>Down Candles</h3>${rows([
        ['Body Down','Bearish candle body',t.dn],
        ['Border Down','Border = darker shade',t.dnB],
        ['Wick Down','Wick = body color',t.dn]])}
      </div>
    </div>

    <div class="dh2"><span class="ddot"></span>Volume</div>
    <p class="dh2sub bn">Symbol tab · set opacity to ${Math.round(t.vol*100)}%</p>
    <div class="dgrid">
      <div class="dcard"><h3>Volume</h3>${rows([
        ['Volume Up','Opacity '+Math.round(t.vol*100)+'%',t.up],
        ['Volume Down','Opacity '+Math.round(t.vol*100)+'%',t.dn]])}
      </div>
    </div>

    <div class="dh2"><span class="ddot"></span><span class="bn">FVG / CRT / Position Tools</span></div>
    <p class="dh2sub bn">Apply in the Style tab of Rectangle, Horizontal Ray and Long/Short tools</p>
    <div class="dgrid">
      <div class="dcard"><h3>Bearish Zone / SL Box</h3>${rows([
        ['Border','Rectangle border',t.tools.rectB],
        ['Background','Opacity '+t.tools.rectOp,t.tools.rectBG]])}
      </div>
      <div class="dcard"><h3>Bullish Zone / TP Box</h3>${rows([
        ['Border','Rectangle border',t.upB],
        ['Background','Opacity '+t.tools.rectOp,t.up]])}
      </div>
      <div class="dcard"><h3>CRT + Lines</h3>${rows([
        ['CRT High/Low + Key Level','Horizontal Ray · dotted',t.tools.line],
        ['Fib / Trend Line','Trend line & fib levels',t.tools.fib],
        ['Drawing Text','Tool label text',dtxt]])}
      </div>
    </div>

    <div class="dh2"><span class="ddot"></span><span class="bn">Long / Short Position Tool</span></div>
    <p class="dh2sub bn">Draw the Long/Short Position tool, then right-click → Settings → Style tab · same colors for both directions</p>
    <div class="dgrid">
      <div class="dcard"><h3>TP Box (Profit Zone)</h3>${rows([
        ['TP Background','Opacity '+t.tools.rectOp,t.up],
        ['TP Border','Darker green shade',t.upB]])}
      </div>
      <div class="dcard"><h3>SL Box (Risk Zone)</h3>${rows([
        ['SL Background','Opacity '+t.tools.rectOp,t.dn],
        ['SL Border','Darker red shade',t.dnB]])}
      </div>
      <div class="dcard"><h3>Entry + Text</h3>${rows([
        ['Entry Line','Position price line',dtxt],
        ['Stats / Label Text','RR & P&L text — best readability','#FFFFFF']])}
      </div>
    </div>

    <div class="dh2"><span class="ddot"></span><span class="bn">Copy All Codes</span></div>
    <button class="copyall bn" id="copyAllBtn">📋 "${t.name}" theme codes in one click</button>

    <div class="dh2"><span class="ddot"></span><span class="bn">How to Apply (2 minutes)</span></div>
    <div class="dsteps">
      <div class="dstep"><p class="bn">Right-click on the chart → <code>Settings…</code> (or the ⚙️ at the bottom right). TradingView has no one-click theme import — set it once manually and it stays saved on every chart.</p></div>
      <div class="dstep"><p class="bn">In the <b>Symbol tab</b> → Candles section, enable <code>Body / Borders / Wick</code> and paste the codes above. Volume colors live here too.</p></div>
      <div class="dstep"><p class="bn">In the <b>Appearance tab</b> → set Background, Grid, Watermark, Crosshair. Set Text color in the <b>Scales tab</b>.</p></div>
      <div class="dstep"><p class="bn">Then <b>Template → Save As Default</b> — every new chart will load "${t.name}" automatically. Drawing tool colors are set per-tool in Settings → Style.</p></div>
    </div>
    <div class="dh2" id="relhead" style="display:none"><span class="ddot"></span><span class="bn">Related Themes</span></div>
    <div class="relgrid" id="relgrid"></div>`;
  // related themes: same category first, then fill with nearest vibe (same dark/light bias)
  const rel=[];
  THEMES.forEach(x=>{if(x.id!==t.id&&x.cat===t.cat)rel.push(x)});
  if(rel.length<3){
    const isDarkish=t.cat==='dark'||t.cat==='ict'||t.cat==='vibrant'||t.cat==='retro'||(t.cat==='legend'&&t.bg<'#888888')||t.cat==='social';
    THEMES.forEach(x=>{
      if(x.id===t.id||rel.some(r=>r.id===x.id))return;
      const xd=x.cat==='dark'||x.cat==='ict'||x.cat==='vibrant'||x.cat==='retro'||(x.cat==='legend'&&x.bg<'#888888')||x.cat==='social';
      if(xd===isDarkish)rel.push(x);
    });
  }
  const relShown=rel.slice(0,3);
  if(relShown.length){
    const rg=detailEl.querySelector('#relgrid');
    detailEl.querySelector('#relhead').style.display='flex';
    relShown.forEach(r=>{
      const c=document.createElement('div');c.className='relcard';
      const s=document.createElementNS(NS,'svg');
      s.setAttribute('viewBox','0 0 260 105');s.setAttribute('preserveAspectRatio','none');
      c.appendChild(s);
      const m=document.createElement('div');m.className='rmeta';
      m.innerHTML=`<h4>${r.name}</h4><span>${CATS[r.cat].icon} ${CATS[r.cat].en} · ${r.tag}</span>`;
      c.appendChild(m);
      c.onclick=()=>openModal(r);
      rg.appendChild(c);
      s.setAttribute('viewBox','0 0 260 105');s.setAttribute('preserveAspectRatio','none');
      drawChart(s,r,260,105,false);
    });
  }
  drawChartInteractive(detailEl.querySelector('.bchart'),t,1200,340);
  detailEl.querySelector('#copyAllBtn').onclick=(e)=>{
    const seen=new Set(),lines=[];
    detailEl.querySelectorAll('.dswbtn').forEach(b=>{const k=b.dataset.name+b.dataset.hex;
      if(!seen.has(k)){seen.add(k);lines.push(b.dataset.name+': '+b.dataset.hex)}});
    const text=`TradingView Theme — "${t.name}" (${CATS[t.cat].en})\n`+'='.repeat(40)+'\n\n'+lines.join('\n');
    navigator.clipboard.writeText(text).then(()=>{
      showToast(null,seen.size);
      const btn=e.target,o=btn.textContent;btn.textContent='✓ Copied! Paste it anywhere';btn.classList.add('done');
      setTimeout(()=>{btn.textContent=o;btn.classList.remove('done')},2200)})};
  detailEl.querySelector('#backbtn').onclick=closeDetail;
  const lgStar=detailEl.querySelector('#favstar-lg');
  if(lgStar)lgStar.onclick=()=>{toggleFav(t.id);const f=isFav(t.id);lgStar.classList.toggle('faved',f);lgStar.innerHTML=f?'★':'☆'};
  document.body.classList.add('detail-mode');
  window.scrollTo({top:0});
  try{history.pushState({detail:t.id},'','#'+t.id)}catch(e){}
}
function closeDetail(){
  document.body.classList.remove('detail-mode');
  try{history.pushState({},'','#')}catch(e){}
}
window.addEventListener('popstate',()=>{if(document.body.classList.contains('detail-mode'))closeDetail()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('detail-mode'))closeDetail()});

renderCatbar();renderGrid();
// random theme button
document.getElementById('dicebtn').onclick=(e)=>{
  const b=e.currentTarget;b.classList.remove('roll');void b.offsetWidth;b.classList.add('roll');
  const pool=THEMES.filter(t=>activeCat==='all'||activeCat==='fav'?true:t.cat===activeCat);
  const pick=pool[Math.floor(Math.random()*pool.length)];
  if(pick)openModal(pick);
};
// deep link: open theme from #hash
if(location.hash.length>1){
  const t=THEMES.find(x=>x.id===location.hash.slice(1));
  if(t)openModal(t);
}
