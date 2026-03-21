import { useState, useEffect, useRef } from 'react';
import { C, F } from '../lib/constants.js';

// ── HR DIVIDER ───────────────────────────────────────────────────────────────
function HR({ gold }) {
  return (
    <div style={{ display:"flex",alignItems:"center",gap:8,margin:"4px 0" }}>
      <div style={{ flex:1,height:1,backgroundColor:gold?C.goldDim:C.border }}/>
      <div style={{ width:5,height:5,borderRadius:"50%",backgroundColor:gold?C.gold:C.border,transform:"rotate(45deg)" }}/>
      <div style={{ flex:1,height:1,backgroundColor:gold?C.goldDim:C.border }}/>
    </div>
  );
}


// ── TYPE STYLES ───────────────────────────────────────────────────────────────
const TYPE_STYLE = {
  witness:   { bg:"#0e1318", border:"#1a3a50", tag:"Witness",   tc:"#5ba3c9" },
  physical:  { bg:"#0e1208", border:"#1a3518", tag:"Physical",  tc:"#5ba060" },
  testimony: { bg:"#130e18", border:"#351a50", tag:"Testimony", tc:"#9b6fca" },
  document:  { bg:"#130e08", border:"#503518", tag:"Document",  tc:"#ca8f5b" },
};

// ── HELPERS ────────────────────────────────────────────────────────────────────
function getInsight(clues, idA, idB) {
  const c = clues.find(x => x.id === idA);
  const lnk = c && c.links && c.links.find(l => l.with === idB);
  if (lnk) return lnk.insight;
  const c2 = clues.find(x => x.id === idB);
  const lnk2 = c2 && c2.links && c2.links.find(l => l.with === idA);
  return lnk2 ? lnk2.insight : null;
}

// ── GRAIN ──────────────────────────────────────────────────────────────────────
function Grain() {
  return <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:200,opacity:0.025,backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,backgroundSize:"150px" }}/>;
}

// ── TIMER HOOK ────────────────────────────────────────────────────────────────
function useTimer(start, running, onExpire) {
  const [rem,setRem]=useState(start);
  useEffect(()=>{
    setRem(start);
  },[start]);
  useEffect(()=>{
    if (!running) return;
    const id=setInterval(()=>{ setRem(r=>{ if(r<=1){clearInterval(id);onExpire();return 0;} return r-1; }); },1000);
    return ()=>clearInterval(id);
  },[running]);
  const addPenalty=n=>setRem(r=>Math.max(0,r-n));
  const mm=String(Math.floor(rem/60)).padStart(2,"0");
  const ss=String(rem%60).padStart(2,"0");
  return { rem, display:`${mm}:${ss}`, urgent:rem<=120, critical:rem<=30, addPenalty };
}

// ── COUNTDOWN ─────────────────────────────────────────────────────────────────


// ── INSIGHT CARD ──────────────────────────────────────────────────────────────
function InsightCard({ insight, clueA, clueB, isNew }) {
  const [open,setOpen]=useState(true);
  return (
    <div style={{ borderRadius:12,overflow:"hidden",animation:isNew?"expandIn 0.4s cubic-bezier(0.16,1,0.3,1)":"none" }}>
      <button onClick={()=>setOpen(v=>!v)} style={{ width:"100%",padding:"12px 16px",backgroundColor:"#0b1a0e",border:"1px solid #1a4020",borderBottom:open?"none":"1px solid #1a4020",borderRadius:open?"12px 12px 0 0":"12px",display:"flex",alignItems:"center",gap:10,cursor:"pointer",textAlign:"left" }}>
        <span style={{ fontSize:F.lg }}>💡</span>
        <span style={{ flex:1,fontSize:F.sm,fontWeight:700,color:"#4a8a5a",fontFamily:"system-ui,sans-serif" }}>{clueA.heading} + {clueB.heading}</span>
        <span style={{ fontSize:F.sm,color:"#3a6a4a" }}>{open?"▴":"▾"}</span>
      </button>
      {open&&(
        <div style={{ backgroundColor:"#0e1a10",border:"1px solid #1a4020",borderTop:"none",borderRadius:"0 0 12px 12px",padding:"14px 16px" }}>
          <p style={{ margin:0,fontSize:F.md,color:"#b0c8b0",lineHeight:1.9,fontFamily:"Georgia,serif",fontStyle:"italic" }}>{insight}</p>
        </div>
      )}
    </div>
  );
}

// ── CLUE CARD ─────────────────────────────────────────────────────────────────
function ClueCard({ clue, revealedIds, linkedPairs, onLink, isNew, open, onToggle, aloneOpen, onToggleAlone, hintUsed, caseData }) {
  const ts=TYPE_STYLE[clue.type]||TYPE_STYLE.document;
  const isLinked=[...linkedPairs].some(k=>k.includes(clue.id));
  const connectable=clue.links?.filter(l=>revealedIds.has(l.with)&&!linkedPairs.has([clue.id,l.with].sort().join("+"))) || [];
  return (
    <div style={{ borderRadius:12,overflow:"hidden",border:`1.5px solid ${isLinked?"#2a5030":ts.border}`,animation:isNew?"slideIn 0.4s cubic-bezier(0.16,1,0.3,1)":"none",transition:"border-color 0.2s" }}>
      <button onClick={onToggle} style={{ width:"100%",padding:"13px 16px",backgroundColor:ts.bg,display:"flex",alignItems:"center",gap:10,border:"none",borderBottom:open?`1px solid ${ts.border}`:"none",cursor:"pointer",textAlign:"left" }}>
        <span style={{ fontSize:F.xl }}>{clue.icon}</span>
        <span style={{ flex:1,fontSize:F.md,fontWeight:700,color:C.cream,fontFamily:"Georgia,serif" }}>{clue.heading}</span>
        {isLinked&&<span style={{ fontSize:F.md }}>🔗</span>}
        {!isLinked&&connectable.length>0&&<span style={{ width:10,height:10,borderRadius:"50%",backgroundColor:C.green,display:"inline-block",flexShrink:0 }}/>}
        <span style={{ fontSize:F.xs,fontWeight:800,letterSpacing:"0.07em",textTransform:"uppercase",color:ts.tc,border:`1px solid ${ts.border}`,padding:"3px 8px",borderRadius:10,fontFamily:"system-ui,sans-serif" }}>{ts.tag}</span>
        <span style={{ fontSize:F.sm,color:C.muted,marginLeft:2 }}>{open?"▴":"▾"}</span>
      </button>
      {open&&(
        <div style={{ padding:"14px 16px 16px",backgroundColor:ts.bg }}>
          <p style={{ margin:"0 0 14px",fontSize:F.md,color:"#c8be9a",lineHeight:1.9,fontFamily:"Georgia,serif",fontStyle:"italic" }}>{clue.text}</p>
          <button onClick={onToggleAlone} style={{ display:"inline-flex",alignItems:"center",gap:7,fontSize:F.sm,fontFamily:"system-ui,sans-serif",background:"none",border:`1px solid ${aloneOpen?C.goldDim:C.border}`,borderRadius:20,padding:"6px 14px",color:aloneOpen?C.gold:C.muted,cursor:"pointer",marginBottom:aloneOpen?12:0,transition:"all 0.15s" }}>
            <span>💡</span>
            <span>{aloneOpen?"Hide reading":"What does this mean?"}</span>
            {!aloneOpen&&!hintUsed&&<span style={{ fontSize:F.xs,opacity:0.55,marginLeft:2 }}>−15s</span>}
          </button>
          {aloneOpen&&(
            <div style={{ padding:"10px 14px",backgroundColor:"rgba(212,168,75,0.05)",borderLeft:`3px solid ${C.goldDim}`,borderRadius:"0 6px 6px 0",marginBottom:connectable.length>0?14:0 }}>
              <p style={{ margin:0,fontSize:F.md,color:C.gold,lineHeight:1.7,fontFamily:"system-ui,sans-serif" }}>🔍 {clue.alone}</p>
            </div>
          )}
          {connectable.length>0&&(
            <div style={{ marginTop:12,display:"flex",flexWrap:"wrap",gap:8 }}>
              {connectable.map(link=>{
                const other=caseData.clues.find(c=>c.id===link.with);
                return (
                  <button key={link.with} onClick={()=>onLink(clue.id,link.with)} style={{ display:"flex",alignItems:"center",gap:7,padding:"9px 16px",borderRadius:20,backgroundColor:"#0e1808",border:"1px solid #2a4020",color:C.green,fontSize:F.sm,fontWeight:600,cursor:"pointer",fontFamily:"system-ui,sans-serif" }}>
                    🔗 Connect with {other?.heading}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}




// ── ANSWER KEY ────────────────────────────────────────────────────────────────
function AnswerKey({ caseData, marks, onCycle, open, onToggle, wrongCount }) {
  const { categories, theme } = caseData;
  const accent = theme.accent;
  const confirmedPerCat = {};
  categories.forEach(cat=>{
    const found=cat.items.find(i=>(marks[cat.key]?.[i.name]||0)===2);
    confirmedPerCat[cat.key]=found?.name||null;
  });
  const canAccuse=categories.every(cat=>confirmedPerCat[cat.key]);
  const summaryParts=categories.map(cat=>{
    const c=confirmedPerCat[cat.key];
    if(c) return `${c.split(" ")[0]} ✓`;
    const q=cat.items.find(i=>(marks[cat.key]?.[i.name]||0)===1);
    if(q) return `${q.name.split(" ")[0]} ?`;
    return null;
  }).filter(Boolean);

  return (
    <div style={{ backgroundColor:canAccuse?C.greenBg:C.paper,border:`2px solid ${canAccuse?C.green:C.border}`,borderRadius:14,overflow:"hidden",transition:"all 0.25s",boxShadow:canAccuse?`0 0 24px ${C.green}33`:"none" }}>
      <button onClick={onToggle} style={{ width:"100%",padding:"14px 18px",backgroundColor:"transparent",border:"none",display:"flex",alignItems:"center",gap:12,cursor:"pointer",textAlign:"left" }}>
        <div style={{ width:10,height:10,borderRadius:"50%",backgroundColor:canAccuse?C.green:C.muted,flexShrink:0,transition:"background-color 0.2s" }}/>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:F.sm,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:canAccuse?C.green:C.muted,fontFamily:"system-ui,sans-serif",marginBottom:3 }}>
            Answer Key {wrongCount>0?`· ❌ ${wrongCount} wrong`:""}
          </div>
          <div style={{ fontSize:F.md,color:canAccuse?C.green:C.muted,fontFamily:"system-ui,sans-serif" }}>
            {summaryParts.length===0?"Tap suspects below to tag them":summaryParts.join(" · ")}
          </div>
        </div>
        <span style={{ fontSize:F.md,color:C.muted }}>{open?"▴":"▾"}</span>
      </button>
      {open&&(
        <div style={{ borderTop:`1px solid ${C.border}`,padding:"16px 18px 18px",animation:"expandIn 0.2s ease" }}>
          <div style={{ display:"flex",gap:8,marginBottom:16,padding:"10px 12px",backgroundColor:C.dim,borderRadius:10,flexWrap:"wrap" }}>
            {[["—","#707080","Untagged"],["?",C.yellow,"Possible"],["✓",C.green,"Your accusation"],["✕",C.red,"Eliminated"]].map(([sym,col,lbl])=>(
              <div key={lbl} style={{ display:"flex",alignItems:"center",gap:6,marginRight:10 }}>
                <span style={{ fontSize:F.md,fontWeight:800,color:col,fontFamily:"system-ui,sans-serif",width:18,textAlign:"center" }}>{sym}</span>
                <span style={{ fontSize:F.xs,color:C.muted,fontFamily:"system-ui,sans-serif" }}>{lbl}</span>
              </div>
            ))}
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
            {categories.map((cat,ci)=>(
              <div key={cat.key}>
                {ci>0&&<div style={{ marginBottom:14 }}><HR/></div>}
                <div style={{ fontSize:F.sm,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:C.muted,marginBottom:10,fontFamily:"system-ui,sans-serif" }}>{cat.icon} {cat.label}</div>
                <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                  {cat.items.map(item=>{
                    const state=marks[cat.key]?.[item.name]||0;
                    const s={
                      0:{bg:C.card,    border:C.border,       nameCol:C.cream,  badge:null, badgeCol:"#707080"},
                      1:{bg:C.yellowBg,border:C.yellowBorder, nameCol:C.yellow, badge:"?",  badgeCol:C.yellow },
                      2:{bg:C.greenBg, border:C.greenBorder,  nameCol:C.green,  badge:"✓",  badgeCol:C.green  },
                      3:{bg:C.redBg,   border:C.redBorder,    nameCol:C.red,    badge:"✕",  badgeCol:C.red    },
                    }[state];
                    return (
                      <button key={item.name} onClick={()=>onCycle(cat.key,item.name)} style={{ display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderRadius:12,backgroundColor:s.bg,border:`2px solid ${s.border}`,cursor:"pointer",textAlign:"left",transition:"all 0.15s",opacity:state===3?0.5:1 }}>
                        <span style={{ fontSize:F.xl }}>{item.icon}</span>
                        <div style={{ flex:1,minWidth:0 }}>
                          <div style={{ fontSize:F.md,fontWeight:state>0?700:400,color:s.nameCol,fontFamily:"Georgia,serif",textDecoration:state===3?"line-through":"none" }}>{item.name}</div>
                          <div style={{ fontSize:F.sm,color:C.muted,fontFamily:"system-ui,sans-serif",marginTop:2 }}>{item.detail}</div>
                        </div>
                        {s.badge&&<span style={{ fontSize:F.xl,fontWeight:800,color:s.badgeCol,fontFamily:"system-ui,sans-serif",flexShrink:0 }}>{s.badge}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {wrongCount>0&&(
            <div style={{ marginTop:16,padding:"10px 14px",backgroundColor:C.redBg,border:`1px solid ${C.redBorder}`,borderRadius:10,fontSize:F.sm,color:C.red,fontFamily:"system-ui,sans-serif" }}>
              ❌ {wrongCount} wrong accusation{wrongCount>1?"s":""} · −{wrongCount*30}s penalty
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── ACCUSE BUTTON ─────────────────────────────────────────────────────────────
function AccuseButton({ caseData, marks, onSubmit, wrongShake, onOpenKey }) {
  const canAccuse=caseData.categories.every(cat=>cat.items.some(i=>(marks[cat.key]?.[i.name]||0)===2));
  return (
    <div style={{ animation:wrongShake?"shake 0.4s ease":"none" }}>
      <button onClick={canAccuse?onSubmit:onOpenKey} style={{ width:"100%",padding:"20px 24px",background:canAccuse?`linear-gradient(135deg,#1a2a10,#0e1a08)`:`linear-gradient(135deg,#161820,#0f1012)`,border:`3px solid ${canAccuse?C.green:C.border}`,borderRadius:16,color:canAccuse?C.green:C.muted,fontSize:canAccuse?F.xl:F.md,fontWeight:800,cursor:"pointer",fontFamily:"Georgia,serif",letterSpacing:canAccuse?"0.06em":"0.02em",transition:"all 0.25s",boxShadow:canAccuse?`0 0 28px ${C.green}55`:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:14 }}>
        {canAccuse ? <><span style={{ fontSize:32 }}>⚖️</span><span>Accuse</span></> : <span>↑ Tag one ✓ per category to accuse</span>}
      </button>
    </div>
  );
}

// ── AD OVERLAY ────────────────────────────────────────────────────────────────
function AdOverlay({ onResume }) {
  const [cd,setCd]=useState(5);
  useEffect(()=>{ if(cd<=0)return; const id=setTimeout(()=>setCd(c=>c-1),1000); return()=>clearTimeout(id); },[cd]);
  return (
    <div style={{ position:"absolute",inset:0,zIndex:150,backgroundColor:"#000",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24 }}>
      <div style={{ position:"absolute",top:16,left:16,fontSize:F.xs,color:"#555",fontFamily:"system-ui,sans-serif",letterSpacing:"0.1em",textTransform:"uppercase" }}>Advertisement</div>
      <div style={{ position:"absolute",top:12,right:16 }}>
        {cd>0 ? <div style={{ fontSize:F.sm,color:"#555",fontFamily:"system-ui,sans-serif" }}>Skip in {cd}s</div>
               : <button onClick={onResume} style={{ padding:"8px 18px",backgroundColor:"#fff",border:"none",borderRadius:6,color:"#000",fontSize:F.sm,fontWeight:700,cursor:"pointer",fontFamily:"system-ui,sans-serif" }}>✕ Skip Ad</button>}
      </div>
      <div style={{ width:"100%",maxWidth:380,textAlign:"center" }}>
        <div style={{ backgroundColor:"#1a1a2e",border:"1px solid #2a2a4e",borderRadius:20,padding:"36px 28px",marginBottom:16 }}>
          <div style={{ fontSize:52,marginBottom:14 }}>🕵️</div>
          <div style={{ fontSize:F.xs,letterSpacing:"0.2em",textTransform:"uppercase",color:"#5a5a8a",fontFamily:"system-ui,sans-serif",marginBottom:8 }}>Sponsored</div>
          <h2 style={{ fontFamily:"Georgia,serif",fontSize:F.xxl,fontWeight:700,color:"#fff",margin:"0 0 10px",lineHeight:1.2 }}>Think You're a Detective?</h2>
          <p style={{ color:"#9090b0",fontSize:F.md,fontFamily:"system-ui,sans-serif",lineHeight:1.6,margin:"0 0 20px" }}>Play 500+ mystery cases on Detective Plus. New cases weekly.</p>
          <div style={{ backgroundColor:"#4a4aff",borderRadius:12,padding:"14px",color:"#fff",fontSize:F.md,fontWeight:700,fontFamily:"system-ui,sans-serif" }}>Try Free for 7 Days →</div>
        </div>
        {cd===0&&<button onClick={onResume} style={{ padding:"12px 28px",backgroundColor:"transparent",border:"1px solid #333",borderRadius:10,color:"#666",fontSize:F.sm,cursor:"pointer",fontFamily:"system-ui,sans-serif" }}>Resume Game</button>}
      </div>
    </div>
  );
}

// ── GAME SCREEN ───────────────────────────────────────────────────────────────
export default function GameScreen({ caseData, tierId, tiers, onSolve, onTimeout, onReset, practice }) {
  // caseData passed as prop from App
  const { clues, categories, solution, theme, timerSeconds } = caseData;

  const initMarks=()=>{ const m={}; categories.forEach(cat=>{m[cat.key]={}; cat.items.forEach(i=>{m[cat.key][i.name]=0;})}); return m; };

  const [marks,        setMarks]        = useState(initMarks);
  const [answerOpen,   setAnswerOpen]   = useState(true);
  const [revealedIds,  setRevealedIds]  = useState(new Set());
  const [feedItems,    setFeedItems]    = useState([]);
  const [linkedPairs,  setLinkedPairs]  = useState(new Set());
  const [wrongShake,   setWrongShake]   = useState(false);
  const [wrongCount,   setWrongCount]   = useState(0);
  const [totalPenalty, setTotalPenalty] = useState(0);
  const [newItemId,    setNewItemId]    = useState(null);
  const [paused,       setPaused]       = useState(false);
  const [clueOpen,     setClueOpen]     = useState({});
  const [aloneOpen,    setAloneOpen]    = useState({});
  const [hintedClues,  setHintedClues]  = useState(new Set());
  const [hintsUsed,    setHintsUsed]    = useState(0);
  const [timerOn,      setTimerOn]      = useState(true);

  const nextIdx     = clues.findIndex(c=>!revealedIds.has(c.id));
  const allRevealed = nextIdx===-1;
  const totalInsights = clues.reduce((n,c)=>n+(c.links?.length||0),0)/2;
  const foundInsights = linkedPairs.size;
  const accent = theme.accent;
  const tierInfo = caseData;

  const { rem, display, urgent, critical, addPenalty } = useTimer(timerSeconds, timerOn&&!paused, onTimeout);
  const timerColor = critical?C.red:urgent?C.gold:accent;

  const cycleMark=(catKey,itemName)=>{
    setMarks(prev=>{
      const cur=prev[catKey][itemName]||0;
      const next=(cur+1)%4;
      const newCat={...prev[catKey],[itemName]:next};
      if(next===2) Object.keys(newCat).forEach(n=>{ if(n!==itemName&&newCat[n]===2) newCat[n]=1; });
      return {...prev,[catKey]:newCat};
    });
  };

  const getConfirmed=()=>{
    const r={};
    categories.forEach(cat=>{
      const found=cat.items.find(i=>(marks[cat.key]?.[i.name]||0)===2);
      r[cat.key]=found?.name||null;
    });
    return r;
  };

  const revealNext=()=>{
    if(allRevealed) return;
    const clue=clues[nextIdx];
    setRevealedIds(prev=>new Set([...prev,clue.id]));
    setFeedItems(prev=>[...prev,{type:"clue",id:clue.id}]);
    setNewItemId(clue.id);
    setAnswerOpen(false);
    setClueOpen(prev=>{ const n={}; Object.keys(prev).forEach(id=>{n[id]=false;}); n[clue.id]=true; return n; });
    setAloneOpen(prev=>({...prev,[clue.id]:false}));
    setTimeout(()=>setNewItemId(null),700);
  };

  const handleToggleAlone=(clueId)=>{
    const isOpening=!aloneOpen[clueId];
    if(isOpening&&!hintedClues.has(clueId)){ addPenalty(15); setHintsUsed(h=>h+1); setHintedClues(prev=>new Set([...prev,clueId])); }
    setAloneOpen(prev=>({...prev,[clueId]:!aloneOpen[clueId]}));
  };

  const handleLink=(idA,idB)=>{
    const key=[idA,idB].sort().join("+");
    if(linkedPairs.has(key)) return;
    const insight=getInsight(clues,idA,idB); if(!insight) return;
    const clueA=clues.find(c=>c.id===idA),clueB=clues.find(c=>c.id===idB);
    setLinkedPairs(prev=>new Set([...prev,key]));
    setFeedItems(prev=>{ const iA=prev.findIndex(i=>i.id===idA),iB=prev.findIndex(i=>i.id===idB); const n=[...prev]; n.splice(Math.max(iA,iB)+1,0,{type:"insight",id:key,clueA,clueB,insight}); return n; });
    setNewItemId(key); setTimeout(()=>setNewItemId(null),800);
  };

  const submit=()=>{
    const confirmed=getConfirmed();
    const correct=categories.every(cat=>confirmed[cat.key]===solution[cat.key]);
    if(correct){ setTimerOn(false); onSolve({accusation:confirmed,foundInsights,wrongCount,totalPenalty,timeRemaining:rem,hintsUsed,tierId}); }
    else{ setWrongShake(true); setWrongCount(w=>w+1); setTotalPenalty(p=>p+30); addPenalty(30); setTimeout(()=>setWrongShake(false),500); }
  };

  return (
    <div style={{ minHeight:"100vh",backgroundColor:theme.bg,position:"relative" }}>
      <Grain/>
      {paused&&<AdOverlay onResume={()=>setPaused(false)}/>}
      <style>{`
        @keyframes slideIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes expandIn{from{opacity:0;transform:scaleY(0.9);transform-origin:top}to{opacity:1;transform:scaleY(1)}}
        @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-9px)}40%{transform:translateX(9px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
      `}</style>

      {/* Header */}
      <div style={{ backgroundColor:theme.bg,borderBottom:`1px solid ${C.border}`,padding:"12px 18px",display:"flex",alignItems:"center",gap:10 }}>
        <button onClick={onReset} style={{ padding:"7px 12px",backgroundColor:"transparent",border:`1px solid ${C.border}`,borderRadius:7,color:C.muted,fontSize:F.sm,cursor:"pointer",fontFamily:"system-ui,sans-serif" }}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <div style={{ fontSize:F.xs,letterSpacing:"0.15em",textTransform:"uppercase",color:theme.accentDim,fontFamily:"system-ui,sans-serif" }}>Daily Whodunit{practice?" · 🎯 Practice":""}</div>
            <div style={{ display:"flex",gap:3 }}>
              {[...Array(3)].map((_,i)=>(
                <div key={i} style={{ width:7,height:7,borderRadius:"50%",backgroundColor:i<tierInfo.stars?tierInfo.color:C.dim }}/>
              ))}
            </div>
          </div>
          <div style={{ fontSize:F.lg,fontWeight:700,color:C.cream,fontFamily:"Georgia,serif" }}>{caseData.title}</div>
        </div>
        <div style={{ display:"flex",gap:4 }}>
          {clues.map((_,i)=>(
            <div key={i} style={{ width:revealedIds.size>i?11:8,height:revealedIds.size>i?11:8,borderRadius:"50%",backgroundColor:revealedIds.size>i?accent:C.dim,transition:"all 0.2s",border:revealedIds.size>i?"none":`1px solid ${C.border}` }}/>
          ))}
        </div>
        {foundInsights>0&&(
          <div style={{ display:"flex",alignItems:"center",gap:5,padding:"5px 10px",backgroundColor:"#0e1808",border:"1px solid #1a4020",borderRadius:12 }}>
            <span style={{ fontSize:F.sm }}>💡</span>
            <span style={{ fontSize:F.sm,fontWeight:700,color:C.green,fontFamily:"system-ui,sans-serif" }}>{foundInsights}/{totalInsights}</span>
          </div>
        )}
        <div style={{ display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:9,backgroundColor:paused?"#1a1808":critical?"#1a0808":urgent?"#1a1008":C.paper,border:`1px solid ${paused?C.goldDim:critical?"#7a2020":urgent?"#7a5010":C.border}`,minWidth:80,justifyContent:"center" }}>
          <span style={{ fontSize:F.sm }}>{paused?"⏸":critical?"🚨":urgent?"⚠️":"⏱️"}</span>
          <span style={{ fontSize:F.lg,fontWeight:800,color:paused?C.goldDim:timerColor,fontFamily:"monospace",animation:critical&&!paused?"blink 0.6s ease infinite":"none" }}>{display}</span>
        </div>
        <button onClick={()=>setPaused(true)} title="Pause" style={{ width:36,height:36,borderRadius:9,backgroundColor:C.dim,border:`1px solid ${C.border}`,color:C.muted,fontSize:F.md,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>⏸</button>
      </div>

      <div style={{ maxWidth:540,margin:"0 auto",padding:"18px 18px 36px" }}>
        {/* Answer key */}
        <div style={{ marginBottom:14 }}>
          <AnswerKey caseData={caseData} marks={marks} onCycle={cycleMark} open={answerOpen} onToggle={()=>setAnswerOpen(v=>!v)} wrongCount={wrongCount}/>
        </div>
        {/* Accuse */}
        <div style={{ marginBottom:20 }}>
          <AccuseButton caseData={caseData} marks={marks} onSubmit={submit} wrongShake={wrongShake} onOpenKey={()=>setAnswerOpen(true)}/>
        </div>
        {/* Divider */}
        <div style={{ display:"flex",alignItems:"center",gap:12,margin:"4px 0 18px" }}>
          <div style={{ flex:1,height:1,backgroundColor:C.border }}/>
          <span style={{ fontSize:F.xs,color:C.muted,fontFamily:"system-ui,sans-serif",letterSpacing:"0.1em",textTransform:"uppercase" }}>Evidence</span>
          <div style={{ flex:1,height:1,backgroundColor:C.border }}/>
        </div>
        {/* Empty state */}
        {feedItems.length===0&&(
          <div style={{ textAlign:"center",padding:"40px 20px",color:C.muted,fontSize:F.md,fontFamily:"Georgia,serif",fontStyle:"italic",border:`1px dashed ${C.border}`,borderRadius:12,lineHeight:1.9,marginBottom:16 }}>
            {caseData.emptyState || `${caseData.setting.split(' · ')[0]} is quiet.`}
          </div>
        )}
        {/* Feed */}
        <div style={{ display:"flex",flexDirection:"column",gap:10,marginBottom:16 }}>
          {feedItems.map(item=>{
            if(item.type==="insight") return <InsightCard key={item.id} insight={item.insight} clueA={item.clueA} clueB={item.clueB} isNew={item.id===newItemId}/>;
            const clue=clues.find(c=>c.id===item.id);
            const isOpen=clueOpen[clue.id]!==false;
            const isAlone=aloneOpen[clue.id]===true;
            return <ClueCard key={clue.id} clue={clue} revealedIds={revealedIds} linkedPairs={linkedPairs} onLink={handleLink} isNew={clue.id===newItemId} open={isOpen} onToggle={()=>setClueOpen(prev=>({...prev,[clue.id]:!isOpen}))} aloneOpen={isAlone} onToggleAlone={()=>handleToggleAlone(clue.id)} hintUsed={hintedClues.has(clue.id)} caseData={caseData}/>;
          })}
        </div>
        {/* Next clue */}
        {!allRevealed&&(
          <button onClick={revealNext} style={{ width:"100%",padding:"16px",background:"linear-gradient(135deg,#1a2008,#0e1305)",border:"1px solid #2a4020",borderRadius:12,color:C.green,fontSize:F.lg,fontWeight:700,cursor:"pointer",fontFamily:"Georgia,serif",letterSpacing:"0.03em" }}>
            {feedItems.length===0?"Begin Investigation →":"Next Clue →"}
          </button>
        )}
      </div>
    </div>
  );
}
