import { useState, useEffect } from 'react';
import { C, F } from '../lib/constants.js';
import { trackShareClicked } from '../lib/analytics.js';

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


export default function SolvedScreen({ result, onReset }) {
  const [vis,setVis]=useState(false);
  useEffect(()=>{setTimeout(()=>setVis(true),80);},[]);
  const { accusation,foundInsights,wrongCount,hintsUsed=0,timeRemaining,tierId } = result;
  const caseData = result.caseData || {};
  const { clues,categories,theme,epilogue,timerSeconds } = caseData;
  const tierInfo = caseData;
  const totalInsights=clues.reduce((n,c)=>n+(c.links?.length||0),0)/2;
  const timeUsed=timerSeconds-timeRemaining;
  const mm=String(Math.floor(timeUsed/60)).padStart(2,"0"),ss=String(timeUsed%60).padStart(2,"0");
  const score = result.score ?? Math.max(0,Math.round((timeRemaining/timerSeconds)*100)-wrongCount*15-hintsUsed*5);
  const rankIcon = result.rank?.icon ?? (score>=80?"🏆":score>=50?"🥈":"🥉");
  const rankLabel = result.rank?.label ?? (score>=80?"Beyond Doubt":score>=50?"Probable Cause":"Reasonable Doubt");
 const accent=theme.accent;
  const shareText = result.shareText || '';

  return (
    <div style={{ minHeight:"100vh",backgroundColor:theme.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 20px" }}>
      
      <div style={{ position:"fixed",inset:0,background:"radial-gradient(ellipse at center,transparent 40%,rgba(0,0,0,0.75) 100%)",pointerEvents:"none" }}/>
      <style>{`@keyframes gleam{0%,100%{text-shadow:0 0 12px rgba(212,168,75,0.3)}50%{text-shadow:0 0 30px rgba(212,168,75,0.7)}}`}</style>
      <div style={{ maxWidth:420,width:"100%",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(16px)",transition:"all 0.55s cubic-bezier(0.16,1,0.3,1)",position:"relative",zIndex:10 }}>
        <div style={{ textAlign:"center",marginBottom:20 }}>
          <div style={{ fontSize:56,marginBottom:12,animation:"gleam 2s ease-in-out infinite" }}>⚖️</div>
          <div style={{ fontSize:F.sm,letterSpacing:"0.2em",textTransform:"uppercase",color:theme.accentDim,fontFamily:"system-ui,sans-serif",marginBottom:6 }}>Daily Whodunit · Case Closed · {tierInfo.label}</div>
          <h2 style={{ fontFamily:"Georgia,serif",fontSize:F.xxl,fontWeight:700,color:C.cream,margin:"0 0 5px",letterSpacing:"-0.02em" }}>Justice Served.</h2>
          <p style={{ color:C.muted,fontSize:F.md,margin:0,fontFamily:"system-ui,sans-serif" }}>{rankIcon} {rankLabel} · {score} pts</p>
        </div>
        <HR gold/>
        <div style={{ backgroundColor:C.paper,border:`1px solid #4a3a18`,borderRadius:14,padding:18,margin:"16px 0" }}>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:16 }}>
            {[["⏱️","Time",`${mm}:${ss}`],["💡","Insights",`${foundInsights}/${totalInsights}`],["❌","Wrong",`${wrongCount}`],["🔦","Hints",`${hintsUsed}`]].map(([icon,label,val])=>(
              <div key={label} style={{ textAlign:"center",padding:"12px 4px",backgroundColor:C.card,borderRadius:10,border:`1px solid ${C.border}` }}>
                <div style={{ fontSize:F.lg,marginBottom:5 }}>{icon}</div>
                <div style={{ fontSize:F.lg,fontWeight:800,color:C.cream,fontFamily:"Georgia,serif" }}>{val}</div>
                <div style={{ fontSize:F.xs,color:C.muted,fontFamily:"system-ui,sans-serif",marginTop:3,textTransform:"uppercase",letterSpacing:"0.04em" }}>{label}</div>
              </div>
            ))}
          </div>
          <HR/>
          <div style={{ marginTop:14 }}>
            <div style={{ fontSize:F.sm,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:theme.accentDim,marginBottom:12,fontFamily:"system-ui,sans-serif" }}>Your Verdict</div>
            {categories.map(cat=>(
              <div key={cat.key} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 0",borderBottom:`1px solid ${C.border}` }}>
                <span style={{ fontSize:F.md,color:C.muted,fontFamily:"system-ui,sans-serif" }}>{cat.icon} {cat.label}</span>
                <span style={{ fontSize:F.md,fontWeight:700,color:accent,fontFamily:"Georgia,serif" }}>{accusation[cat.key]}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Share row — Copy + SMS */}
        <div style={{ display:"flex",gap:10,marginBottom:10 }}>
          <button
            onClick={()=>navigator.clipboard.writeText(shareText).then(()=>alert("Copied!"))}
            style={{ flex:1,padding:"14px",backgroundColor:"#0e1808",border:"1px solid #2a4020",borderRadius:10,color:C.green,fontSize:F.md,fontWeight:700,cursor:"pointer",fontFamily:"system-ui,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}
          >
            📋 Copy
          </button>
          <button
            onClick={()=>{
              const encoded = encodeURIComponent(shareText);
              // iOS/Android SMS
              if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                trackShareClicked({ method: 'text', caseNum: caseNum||'', tier: tierId||'', score: score||0, rank: rankLabel||'' });
      window.location.href = `sms:?&body=${encoded}`;
              } else {
                // Desktop fallback — copy and show message
                navigator.clipboard.writeText(shareText).then(()=>alert("Copied! Paste into any message app."));
              }
            }}
            style={{ flex:1,padding:"14px",backgroundColor:"#0e100a",border:"1px solid #2a4020",borderRadius:10,color:C.green,fontSize:F.md,fontWeight:700,cursor:"pointer",fontFamily:"system-ui,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}
          >
            💬 Text
          </button>
          <button
            onClick={()=>{
              if (navigator.share) {
                navigator.share({ text: shareText }).catch(()=>{});
              } else {
                navigator.clipboard.writeText(shareText).then(()=>alert("Copied!"));
              }
            }}
            style={{ flex:1,padding:"14px",backgroundColor:"#0e100a",border:"1px solid #2a4020",borderRadius:10,color:C.green,fontSize:F.md,fontWeight:700,cursor:"pointer",fontFamily:"system-ui,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}
          >
            🔗 Share
          </button>
        </div>
        <div style={{ backgroundColor:"#0e1008",border:"1px solid #1a3018",borderRadius:12,padding:"14px 16px",marginBottom:20 }}>
          <div style={{ fontSize:F.sm,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:C.green,marginBottom:8,fontFamily:"system-ui,sans-serif" }}>Epilogue</div>
          <p style={{ margin:0,fontSize:F.md,color:"#a8b89a",lineHeight:1.9,fontFamily:"Georgia,serif",fontStyle:"italic" }}>{epilogue}</p>
        </div>
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={()=>onReset("level")} style={{ flex:1,padding:"14px",background:"transparent",border:`1px solid ${C.border}`,borderRadius:10,color:C.muted,fontSize:F.sm,fontWeight:700,cursor:"pointer",fontFamily:"system-ui,sans-serif" }}>Change Difficulty</button>
          <button onClick={()=>onReset("level")} style={{ flex:1,padding:"14px",background:`linear-gradient(135deg,#2a1a08,#1a1005)`,border:`1px solid ${accent}`,borderRadius:10,color:accent,fontSize:F.md,fontWeight:700,cursor:"pointer",fontFamily:"Georgia,serif",letterSpacing:"0.03em" }}>Play Again</button>
        </div>
        <div style={{ textAlign:"center",marginTop:14,fontSize:F.xs,color:"#2a2218",fontFamily:"system-ui,sans-serif" }}>Your daily ten minute mystery · thedailywhodunit.com</div>
      </div>
    </div>
  );
}
