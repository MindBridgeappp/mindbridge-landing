import { useState, useEffect, useRef } from "react";

var C = {
  bg:"#070d16", surface:"#0d1525", card:"#111c2e", border:"#1b2a40", borderHi:"#2a3f5f",
  sage:"#4ade80", sageDim:"rgba(74,222,128,0.12)", sageMid:"#16a34a",
  blue:"#38bdf8", blueDim:"rgba(56,189,248,0.10)", blueMid:"#0284c7",
  amber:"#fb923c", red:"#f87171", purple:"#a78bfa",
  white:"#e2eaf4", muted:"#5a7090", hi:"#8ba3bf",
};

function injectCSS() {
  if (document.getElementById("ml-css")) return;
  var el = document.createElement("style");
  el.id = "ml-css";
  el.textContent = [
    "@keyframes mlFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}",
    "@keyframes mlPulse{0%,100%{opacity:1}50%{opacity:.35}}",
    "@keyframes mlGlow{0%,100%{box-shadow:0 0 20px #4ade8033}50%{box-shadow:0 0 40px #4ade8077}}",
    "@keyframes mlSpin{to{transform:rotate(360deg)}}",
    "@keyframes mlFadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}",
    "@keyframes mlOrb{0%{transform:scale(1) translate(0,0)}50%{transform:scale(1.1) translate(12px,-10px)}100%{transform:scale(1) translate(0,0)}}",
    "@keyframes mlWave{from{transform:scaleY(.3)}to{transform:scaleY(1)}}",
    "@keyframes mlBar{from{width:0}to{width:var(--w)}}",
    ".mlBtn{cursor:pointer;border:none;outline:none;font-family:inherit;transition:all .2s;}",
    ".mlBtn:active{transform:scale(.97);}",
    ".mlCard{transition:all .22s;} .mlCard:hover{border-color:#2a3f5f!important;transform:translateY(-3px);}",
    "*{box-sizing:border-box;margin:0;padding:0;}",
    "body{font-family:'Inter',system-ui,sans-serif;}",
    "::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-thumb{background:#1b2a40;border-radius:4px}",
    ".faq-ans{max-height:0;overflow:hidden;transition:max-height .35s ease;}",
    ".faq-ans.open{max-height:300px;}",
  ].join("");
  document.head.appendChild(el);
}

function useInView(t) {
  var ref = useRef(null);
  var [v, setV] = useState(false);
  useEffect(function() {
    var el = ref.current; if (!el) return;
    var obs = new IntersectionObserver(function(e) { if (e[0].isIntersecting) { setV(true); obs.disconnect(); } }, {threshold: t||0.12});
    obs.observe(el);
    return function() { obs.disconnect(); };
  }, []);
  return [ref, v];
}

function Section(props) {
  var [ref, vis] = useInView(0.1);
  var d = props.delay || 0;
  return (
    <div ref={ref} style={Object.assign({opacity:vis?1:0, transform:vis?"translateY(0)":"translateY(22px)", transition:"opacity .6s ease "+d+"s, transform .6s ease "+d+"s"}, props.style||{})}>
      {props.children}
    </div>
  );
}

function Counter(props) {
  var [val, setVal] = useState(0);
  var [ref, vis] = useInView(0.3);
  useEffect(function() {
    if (!vis) return;
    var start = 0; var end = props.end; var dur = 1400;
    var t = setInterval(function() {
      start += Math.ceil(end/60);
      if (start >= end) { setVal(end); clearInterval(t); } else { setVal(start); }
    }, dur/end);
    return function() { clearInterval(t); };
  }, [vis]);
  return <span ref={ref}>{val}{props.suffix||""}</span>;
}

function FaqItem(props) {
  var [open, setOpen] = useState(false);
  return (
    <div style={{borderBottom:"1px solid "+C.border}}>
      <button className="mlBtn" onClick={function(){setOpen(!open);}}
        style={{width:"100%",textAlign:"left",padding:"20px 0",display:"flex",justifyContent:"space-between",alignItems:"center",background:"transparent",color:C.white}}>
        <span style={{fontSize:15,fontWeight:600,lineHeight:1.4,paddingRight:16}}>{props.q}</span>
        <span style={{fontSize:20,color:C.sage,flexShrink:0,transition:"transform .3s",transform:open?"rotate(45deg)":"rotate(0deg)"}}>+</span>
      </button>
      <div className={"faq-ans"+(open?" open":"")}>
        <div style={{fontSize:14,color:C.hi,lineHeight:1.75,paddingBottom:20}}>{props.a}</div>
      </div>
    </div>
  );
}

function LeadForm(props) {
  var [nome,setNome]=useState("");
  var [email,setEmail]=useState("");
  var [role,setRole]=useState("");
  var [sent,setSent]=useState(false);
  var [loading,setLoading]=useState(false);
  var [err,setErr]=useState("");

  function validate(){
    if(!nome.trim()){setErr("Insira seu nome.");return false;}
    if(!email.trim()||!/\S+@\S+\.\S+/.test(email)){setErr("Insira um e-mail válido.");return false;}
    if(!role){setErr("Selecione seu perfil.");return false;}
    return true;
  }

  function submit(){
    setErr("");
    if(!validate())return;
    setLoading(true);
    fetch("https://api.airtable.com/v0/appteFIHgmwhEikuh/Table%201",{
      method:"POST",
      headers:{
        "Authorization":"Bearer patR4UtvduuGEpNQy.a9be7de6c8ec1f1b1bfb8041f7ab7b9c4858b17d4055417cbcb0552757cd1ee3",
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        fields:{
          "Name":nome,
          "Email":email,
          "Date":new Date().toISOString().slice(0,10),
          "perfil":role
        }
      })
    })
    .then(function(res){return res.json();})
    .then(function(){
      setLoading(false);
      setSent(true);
      if(props.onSuccess)props.onSuccess({email:email,role:role});
    })
    .catch(function(){
      setLoading(false);
      setErr("Erro ao salvar. Tente novamente.");
    });
  }

  if(sent)return(
    <div style={{textAlign:"center",padding:"32px 24px"}}>
      <div style={{fontSize:40,marginBottom:12,animation:"mlFloat 3s ease-in-out infinite"}}>🎉</div>
      <div style={{fontSize:20,fontWeight:800,color:C.white,marginBottom:8}}>Você está na lista, {nome.split(" ")[0]}!</div>
      <div style={{fontSize:14,color:C.hi,lineHeight:1.7}}>
        Assim que o beta abrir, você será um dos primeiros a saber.<br/>
        <span style={{color:C.sage}}>Obrigado por acreditar no MindBridge.</span>
      </div>
    </div>
  );

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <input
        type="text" value={nome} onChange={function(e){setNome(e.target.value);setErr("");}}
        placeholder="Seu nome completo"
        style={{background:C.surface,border:"1px solid "+(err&&!nome?C.red:C.border),borderRadius:12,padding:"14px 16px",color:C.white,fontSize:14,outline:"none",fontFamily:"inherit",width:"100%"}}
        onFocus={function(e){e.target.style.borderColor=C.blue;}}
        onBlur={function(e){e.target.style.borderColor=C.border;}}
      />
      <input
        type="email" value={email} onChange={function(e){setEmail(e.target.value);setErr("");}}
        placeholder="seu@email.com"
        style={{background:C.surface,border:"1px solid "+(err&&!email?C.red:C.border),borderRadius:12,padding:"14px 16px",color:C.white,fontSize:14,outline:"none",fontFamily:"inherit",width:"100%"}}
        onFocus={function(e){e.target.style.borderColor=C.blue;}}
        onBlur={function(e){e.target.style.borderColor=C.border;}}
      />
      <select value={role} onChange={function(e){setRole(e.target.value);setErr("");}}
        style={{background:C.surface,border:"1px solid "+(err&&!role?C.red:C.border),borderRadius:12,padding:"14px 16px",color:role?C.white:C.muted,fontSize:14,outline:"none",fontFamily:"inherit",width:"100%",cursor:"pointer"}}>
        <option value="" disabled>Sou um(a)...</option>
        <option value="psicologo">Psicólogo(a)</option>
        <option value="estudante">Estudante de Psicologia</option>
        <option value="clinica">Gestora(o) de Clínica</option>
        <option value="outro">Outro</option>
      </select>
      {err&&<div style={{fontSize:12,color:C.red}}>{err}</div>}
      <button className="mlBtn" onClick={submit}
        style={{background:loading?C.border:"linear-gradient(135deg,"+C.sageMid+","+C.blueMid+")",borderRadius:12,padding:"15px",color:"white",fontWeight:700,fontSize:15,boxShadow:loading?"none":"0 0 32px rgba(74,222,128,0.35)",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
        {loading
          ?<><span style={{width:16,height:16,borderRadius:"50%",border:"2px solid #fff3",borderTopColor:"white",animation:"mlSpin .7s linear infinite",display:"inline-block"}}></span>Aguarde...</>
          :"Quero entrar na lista beta →"}
      </button>
      <div style={{fontSize:11,color:C.muted,textAlign:"center"}}>Sem spam. Cancele quando quiser.</div>
    </div>
  );
}

/* ── MOCKUP: App do Paciente ── */
function AppMockup() {
  var [step,setStep]=useState(0);
  var steps=[
    {screen:"mood"},{screen:"tags"},{screen:"breath"},{screen:"done"}
  ];
  useEffect(function(){var t=setInterval(function(){setStep(function(s){return(s+1)%steps.length;});},2800);return function(){clearInterval(t);};});
  var s=steps[step];

  var PhoneWrap = function(p) {
    return (
      <div style={{width:180,background:"#070d16",borderRadius:28,padding:"14px 12px 20px",boxShadow:"0 24px 60px rgba(0,0,0,.7),0 0 0 1px #1b2a40",position:"relative",minHeight:340,display:"flex",flexDirection:"column"}}>
        <div style={{width:56,height:16,background:"#000",borderRadius:"0 0 10px 10px",margin:"0 auto 12px",display:"flex",alignItems:"center",justifyContent:"center",gap:4,flexShrink:0}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:"#111"}}/>
          <div style={{width:16,height:3,borderRadius:2,background:"#111"}}/>
        </div>
        <div style={{flex:1,display:"flex",flexDirection:"column"}}>{p.children}</div>
      </div>
    );
  };

  if(s.screen==="mood") return(
    <PhoneWrap>
      <div style={{fontFamily:"monospace",fontSize:8,color:C.muted,textAlign:"center",marginBottom:8}}>MindBridge</div>
      <div style={{fontFamily:"Georgia,serif",fontSize:11,color:C.white,textAlign:"center",fontStyle:"italic",marginBottom:12,lineHeight:1.4}}>"Como você está agora?"</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:8}}>
        {[{e:"😊",l:"Alegria",c:"#4ade80"},{e:"😌",l:"Calma",c:"#38bdf8"},{e:"😢",l:"Tristeza",c:"#a78bfa"},{e:"😰",l:"Ansiedade",c:"#fb923c",active:true},{e:"😤",l:"Raiva",c:"#f87171"},{e:"😶",l:"Vazio",c:"#64748b"}].map(function(m){
          return(<div key={m.l} style={{background:m.active?m.c+"22":"rgba(255,255,255,0.04)",border:"1px solid "+(m.active?m.c:C.border),borderRadius:10,padding:"8px 2px",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
            <span style={{fontSize:16}}>{m.e}</span>
            <span style={{fontSize:7,color:m.active?m.c:C.muted}}>{m.l}</span>
          </div>);
        })}
      </div>
      <div style={{fontSize:8,color:C.muted,textAlign:"center"}}>Toque para continuar</div>
    </PhoneWrap>
  );

  if(s.screen==="tags") return(
    <PhoneWrap>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4,marginBottom:10}}>
        <span style={{fontSize:12}}>😰</span>
        <span style={{fontSize:10,color:"#fb923c",fontWeight:600}}>Ansiedade</span>
      </div>
      <div style={{fontFamily:"Georgia,serif",fontSize:10,color:C.white,textAlign:"center",fontStyle:"italic",marginBottom:10}}>"O que influenciou?"</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,marginBottom:10}}>
        {[{i:"💼",l:"Trabalho",on:true},{i:"❤️",l:"Relação"},{i:"👨‍👩‍👧",l:"Família"},{i:"🏥",l:"Saúde"},{i:"💸",l:"Dinheiro",on:true},{i:"✦",l:"Outro"}].map(function(t){
          return(<div key={t.l} style={{background:t.on?"rgba(74,222,128,0.12)":"rgba(255,255,255,0.04)",border:"1px solid "+(t.on?C.sage:C.border),borderRadius:9,padding:"7px 2px",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
            <span style={{fontSize:13}}>{t.i}</span>
            <span style={{fontSize:7,color:t.on?C.sage:C.muted}}>{t.l}</span>
          </div>);
        })}
      </div>
      <div style={{background:C.blueDim,border:"1px solid rgba(56,189,248,0.2)",borderRadius:8,padding:"7px 8px",fontSize:9,color:C.blue,textAlign:"center"}}>
        🎙 Desabafo rápido (30s)
      </div>
    </PhoneWrap>
  );

  if(s.screen==="breath") return(
    <PhoneWrap>
      <div style={{fontSize:9,color:C.muted,textAlign:"center",marginBottom:6}}>Vamos equilibrar?</div>
      <div style={{fontFamily:"Georgia,serif",fontSize:11,color:C.white,textAlign:"center",fontStyle:"italic",marginBottom:12}}>Técnica 4-7-8</div>
      <div style={{display:"flex",justifyContent:"center",marginBottom:10}}>
        <div style={{width:72,height:72,borderRadius:"50%",background:"radial-gradient(circle,rgba(251,146,60,0.18) 0%,#0d1525 100%)",border:"2px solid rgba(251,146,60,0.5)",display:"flex",alignItems:"center",justifyContent:"center",animation:"mlGlow 2s ease-in-out infinite"}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:18,color:C.white,fontWeight:700,fontFamily:"monospace"}}>4</div>
            <div style={{fontSize:7,color:C.hi}}>inspire</div>
          </div>
        </div>
      </div>
      <div style={{display:"flex",justifyContent:"space-around",marginBottom:10}}>
        {[{s:"4s",l:"Inspire",a:true},{s:"7s",l:"Segure"},{s:"8s",l:"Expire"}].map(function(p){
          return(<div key={p.l} style={{textAlign:"center",opacity:p.a?1:.3}}>
            <div style={{fontFamily:"monospace",fontSize:13,color:C.hi,fontWeight:700}}>{p.s}</div>
            <div style={{fontSize:7,color:C.muted}}>{p.l}</div>
          </div>);
        })}
      </div>
      <div style={{background:"rgba(251,146,60,0.08)",border:"1px solid rgba(251,146,60,0.2)",borderRadius:8,padding:"6px 8px",fontSize:8,color:C.hi,textAlign:"center"}}>
        3 ciclos · 📳 vibração ativa
      </div>
    </PhoneWrap>
  );

  return(
    <PhoneWrap>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,textAlign:"center"}}>
        <div style={{width:52,height:52,borderRadius:"50%",background:"rgba(74,222,128,0.12)",border:"2px solid "+C.sage,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,animation:"mlFloat 3s ease-in-out infinite"}}>✅</div>
        <div style={{fontFamily:"Georgia,serif",fontSize:13,color:C.white,fontWeight:700}}>Registro salvo!</div>
        <div style={{fontSize:10,color:C.hi,lineHeight:1.6}}>Sua psicóloga verá<br/>antes da próxima sessão.</div>
        <div style={{background:"rgba(74,222,128,0.1)",borderRadius:8,padding:"6px 14px",fontSize:10,color:C.sage}}>
          🔥 4 dias seguidos
        </div>
      </div>
    </PhoneWrap>
  );
}

/* ── MOCKUP: Áudio + Texto ── */
function MediaMockup() {
  var heights = useRef(Array.from({length:22},function(){return 4+Math.random()*20;})).current;
  var [playing,setPlaying]=useState(false);
  var [pos,setPos]=useState(0);
  var dur=24;
  var iRef=useRef(null);
  useEffect(function(){
    if(playing){iRef.current=setInterval(function(){setPos(function(p){if(p>=dur){setPlaying(false);clearInterval(iRef.current);return 0;}return p+1;});},1000);}
    else clearInterval(iRef.current);
    return function(){clearInterval(iRef.current);};
  },[playing]);
  var mm=Math.floor(pos/60).toString().padStart(2,"0");
  var ss=(pos%60).toString().padStart(2,"0");

  return(
    <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:20,padding:24,width:300,display:"flex",flexDirection:"column",gap:14}}>
      <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:2}}>📨 Registro de hoje</div>

      {/* mood chip */}
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:32,height:32,borderRadius:"50%",background:"rgba(251,146,60,0.15)",border:"1px solid rgba(251,146,60,0.4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>😰</div>
        <div>
          <div style={{fontSize:13,fontWeight:600,color:C.white}}>Ansiedade</div>
          <div style={{fontSize:10,color:C.muted}}>Hoje · 22h14</div>
        </div>
        <span style={{marginLeft:"auto",background:"rgba(248,113,113,0.12)",color:C.red,fontSize:9,padding:"2px 8px",borderRadius:20,border:"1px solid rgba(248,113,113,0.3)"}}>⚠ risco</span>
      </div>

      {/* tags */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {["💼 Trabalho","💸 Dinheiro"].map(function(t){return(<span key={t} style={{fontSize:10,padding:"4px 10px",borderRadius:20,background:C.sageDim,color:C.sage,border:"1px solid rgba(74,222,128,0.2)"}}>{t}</span>);})}
      </div>

      {/* texto */}
      <div style={{background:C.surface,borderRadius:12,padding:"12px 14px",border:"1px solid "+C.border}}>
        <div style={{fontSize:10,color:C.muted,marginBottom:6,display:"flex",alignItems:"center",gap:5}}>
          <span>✏️</span><span>Texto enviado</span>
        </div>
        <div style={{fontSize:12,color:C.hi,fontStyle:"italic",lineHeight:1.65}}>
          "Recebi uma crítica do meu chefe hoje e não consegui dormir pensando nisso. Sinto que nada que faço é suficiente..."
        </div>
      </div>

      {/* áudio player */}
      <div style={{background:C.surface,borderRadius:12,padding:"10px 12px",border:"1px solid "+C.border}}>
        <div style={{fontSize:10,color:C.muted,marginBottom:8,display:"flex",alignItems:"center",gap:5}}>
          <span>🎙</span><span>Áudio enviado</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button className="mlBtn" onClick={function(){setPlaying(function(p){return !p;});}}
            style={{width:28,height:28,borderRadius:"50%",background:playing?C.sageMid:C.blueDim,border:"1px solid "+(playing?C.sage:C.blue),display:"flex",alignItems:"center",justifyContent:"center",color:playing?C.sage:C.blue,fontSize:10}}>
            {playing?"⏸":"▶"}
          </button>
          <div style={{display:"flex",alignItems:"center",gap:2,flex:1}}>
            {heights.map(function(h,i){return(
              <div key={i} style={{width:3,borderRadius:2,height:h+"px",background:(i/heights.length)<(pos/dur)?C.sage:C.border,animation:playing&&i%3===0?"mlWave "+(0.6+i*0.05)+"s ease-in-out "+(i*0.03)+"s infinite alternate":"none"}}/>
            );})}
          </div>
          <span style={{fontFamily:"monospace",fontSize:9,color:C.muted,flexShrink:0}}>{playing?mm+":"+ss:"0:24"}</span>
        </div>
      </div>
    </div>
  );
}

/* ── MOCKUP: Painel do Psicólogo ── */
function DoctorMockup() {
  var pts=[3,2,3,4,3,2,1,2,3,4,4,3,2,3,5,4,3,2,2,1,3,4,5,4,3,2,3,4,3,2];
  var W=260,H=56;
  var validPts=pts.map(function(v,i){return{v:v,x:(i/(pts.length-1))*W,y:H-(v/5)*H};});
  var pathD="M"+validPts.map(function(p){return p.x+","+p.y;}).join(" L");
  var fillD=pathD+" L"+W+","+H+" L0,"+H+"Z";

  var tagData=[{l:"Trabalho",n:8,c:C.blue},{l:"Dinheiro",n:5,c:C.purple},{l:"Relação",n:3,c:C.sage},{l:"Família",n:2,c:C.amber}];

  return(
    <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:20,padding:24,width:340}}>
      {/* header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,paddingBottom:14,borderBottom:"1px solid "+C.border}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:C.amber,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"white"}}>MF</div>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:C.white}}>Marina F.</div>
            <div style={{fontSize:10,color:C.muted}}>Hoje 10h · 30 registros</div>
          </div>
        </div>
        <span style={{background:"rgba(248,113,113,0.12)",color:C.red,fontSize:9,fontWeight:700,padding:"3px 9px",borderRadius:20,border:"1px solid rgba(248,113,113,0.3)",animation:"mlPulse 1.5s infinite"}}>🔴 Risco alto</span>
      </div>

      {/* gráfico */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:10}}>📈 Humor — 30 dias</div>
        <svg width={W} height={H} viewBox={"0 0 "+W+" "+H} style={{overflow:"visible",display:"block"}}>
          <defs>
            <linearGradient id="dg2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={C.sage} stopOpacity="0.25"/>
              <stop offset="100%" stopColor={C.sage} stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path d={fillD} fill="url(#dg2)"/>
          <path d={pathD} fill="none" stroke={C.sage} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{filter:"drop-shadow(0 0 4px #4ade8077)"}}/>
          {validPts.map(function(p,i){return(<circle key={i} cx={p.x} cy={p.y} r={p.v<=2?3.5:2} fill={p.v<=2?"#f87171":C.sage} style={{filter:p.v<=2?"drop-shadow(0 0 4px #f8717188)":"none"}}/>);})}
        </svg>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
          <span style={{fontFamily:"monospace",fontSize:8,color:C.muted}}>30d atrás</span>
          <span style={{fontFamily:"monospace",fontSize:8,color:C.muted}}>Hoje</span>
        </div>
      </div>

      {/* alerta */}
      <div style={{background:"rgba(248,113,113,0.07)",border:"1px solid rgba(248,113,113,0.25)",borderLeft:"3px solid "+C.red,borderRadius:10,padding:"10px 12px",marginBottom:14,fontSize:11,color:C.white,lineHeight:1.5}}>
        ⚠️ <strong>Alerta automático:</strong> Pico de ansiedade ontem às 22h — fuga do padrão habitual.
      </div>

      {/* gatilhos */}
      <div style={{marginBottom:14}}>
        <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:10}}>🏷️ Gatilhos frequentes</div>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {tagData.map(function(t){
            var pct=(t.n/tagData[0].n)*100;
            return(
              <div key={t.l} style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:11,color:C.hi,width:60,flexShrink:0}}>{t.l}</span>
                <div style={{flex:1,height:6,background:C.border,borderRadius:3,overflow:"hidden"}}>
                  <div style={{height:"100%",width:pct+"%",background:t.c,borderRadius:3,filter:"drop-shadow(0 0 4px "+t.c+"88)"}}/>
                </div>
                <span style={{fontFamily:"monospace",fontSize:9,color:C.muted,width:20,textAlign:"right"}}>×{t.n}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* desabafos preview */}
      <div>
        <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:10}}>💬 Último desabafo</div>
        <div style={{background:C.surface,borderRadius:10,padding:"10px 12px",border:"1px solid "+C.border}}>
          <div style={{fontSize:11,color:C.hi,fontStyle:"italic",lineHeight:1.6,marginBottom:8}}>
            "Recebi uma crítica do meu chefe e não consegui dormir..."
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:14,height:14,borderRadius:"50%",background:C.blueDim,border:"1px solid "+C.blue,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:C.blue}}>▶</div>
            <div style={{flex:1,height:4,background:C.border,borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",width:"35%",background:C.blue,borderRadius:2}}/>
            </div>
            <span style={{fontFamily:"monospace",fontSize:8,color:C.muted}}>0:24</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── MAIN ── */
export default function Landing() {
  injectCSS();
  var [leads,setLeads]=useState(function(){return JSON.parse(localStorage.getItem("mb_leads")||"[]").length;});
  var [toast,setToast]=useState(null);

  function handleLead(d){setLeads(function(n){return n+1;});setToast("✓ "+d.email+" adicionado à lista!");setTimeout(function(){setToast(null);},4000);}

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.white,fontFamily:"'Inter',system-ui,sans-serif",overflowX:"hidden"}}>

      {toast&&<div style={{position:"fixed",bottom:24,right:24,zIndex:999,background:C.sageMid,color:"white",padding:"12px 20px",borderRadius:12,fontSize:13,fontWeight:600,boxShadow:"0 8px 32px rgba(0,0,0,.4)",animation:"mlFadeUp .3s ease"}}>{toast}</div>}

      {/* NAV */}
      <nav style={{position:"sticky",top:0,zIndex:100,background:"rgba(7,13,22,0.88)",backdropFilter:"blur(14px)",borderBottom:"1px solid "+C.border,padding:"14px 28px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,"+C.sageMid+","+C.blueMid+")",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🧠</div>
          <span style={{fontWeight:800,fontSize:16,letterSpacing:"-0.5px"}}>Mind<span style={{color:C.sage}}>Bridge</span></span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <span style={{fontSize:12,color:C.muted,display:"flex",alignItems:"center",gap:6}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:C.sage,display:"inline-block",animation:"mlPulse 2s infinite"}}></span>Beta em breve
          </span>
          <a href="#cta" style={{background:"linear-gradient(135deg,"+C.sageMid+","+C.blueMid+")",borderRadius:20,padding:"8px 18px",color:"white",fontWeight:700,fontSize:12,textDecoration:"none",boxShadow:"0 0 20px rgba(74,222,128,0.25)"}}>
            Entrar na lista →
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{maxWidth:1100,margin:"0 auto",padding:"80px 24px 60px",textAlign:"center",position:"relative"}}>
        <div style={{position:"absolute",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(74,222,128,0.06) 0%,transparent 70%)",top:-120,left:"50%",transform:"translateX(-50%)",pointerEvents:"none",animation:"mlOrb 9s ease-in-out infinite"}}/>

        <Section>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:C.sageDim,border:"1px solid rgba(74,222,128,0.2)",borderRadius:20,padding:"6px 16px",fontSize:12,color:C.sage,marginBottom:28,fontWeight:600}}>
            <span style={{animation:"mlPulse 2s infinite"}}>●</span>Beta Privado · Vagas limitadas
          </div>
        </Section>

        <Section delay={0.1}>
          <h1 style={{fontSize:"clamp(34px,5.5vw,68px)",fontWeight:900,lineHeight:1.06,letterSpacing:"-2px",marginBottom:12,maxWidth:820,margin:"0 auto 20px"}}>
            Seu paciente vai dizer que<br/>foi uma semana ok.<br/>
            <span style={{background:"linear-gradient(90deg,"+C.sage+","+C.blue+")",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Você sabe que não foi.</span>
          </h1>
        </Section>

        <Section delay={0.2}>
          <p style={{fontSize:"clamp(15px,1.8vw,19px)",color:C.hi,maxWidth:580,margin:"0 auto 36px",lineHeight:1.8}}>
            MindBridge captura o estado emocional do seu paciente todos os dias em 30 segundos — e entrega a você um painel clínico completo antes de cada sessão, com gráficos, alertas de risco e os desabafos reais da semana.
          </p>
        </Section>

        <Section delay={0.3}>
          <div style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center",marginBottom:14}}>
            <a href="#cta" style={{background:"linear-gradient(135deg,"+C.sageMid+","+C.blueMid+")",borderRadius:14,padding:"16px 32px",color:"white",fontWeight:800,fontSize:16,textDecoration:"none",boxShadow:"0 0 40px rgba(74,222,128,0.35)",display:"inline-flex",alignItems:"center",gap:8}}>
              🚀 Quero entrar no beta
            </a>
            <a href="#como-funciona" style={{background:"rgba(255,255,255,0.06)",border:"1px solid "+C.border,borderRadius:14,padding:"16px 28px",color:C.hi,fontWeight:600,fontSize:15,textDecoration:"none"}}>
              Ver como funciona ↓
            </a>
          </div>
          <div style={{fontSize:12,color:C.muted}}>{leads>0?leads+" psicólogos já entraram na lista":"Seja um dos primeiros"} · Gratuito no beta</div>
        </Section>
      </section>

      {/* STATS */}
      <section style={{background:C.surface,borderTop:"1px solid "+C.border,borderBottom:"1px solid "+C.border,padding:"48px 24px"}}>
        <div style={{maxWidth:860,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,textAlign:"center",gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))"}}>
          {[{n:70,suf:"%",l:"dos pacientes não conseguem descrever a semana com precisão"},{n:10,suf:"min",l:"economizados por sessão com o painel clínico inteligente"},{n:3,suf:"x",l:"mais engajamento entre sessões com check-ins diários"}].map(function(s,i){
            return(
              <Section key={i} delay={i*.1} style={{padding:"0 12px"}}>
                <div style={{fontSize:"clamp(36px,5vw,54px)",fontWeight:900,background:"linear-gradient(135deg,"+C.sage+","+C.blue+")",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",lineHeight:1}}>
                  <Counter end={s.n} suffix={s.suf}/>
                </div>
                <div style={{fontSize:13,color:C.muted,marginTop:10,lineHeight:1.6}}>{s.l}</div>
              </Section>
            );
          })}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" style={{maxWidth:1100,margin:"0 auto",padding:"96px 24px"}}>
        <Section style={{textAlign:"center",marginBottom:72}}>
          <div style={{fontSize:12,color:C.sage,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>Como funciona</div>
          <h2 style={{fontSize:"clamp(28px,4vw,48px)",fontWeight:900,letterSpacing:"-1px",marginBottom:16}}>
            Três blocos. Uma ponte completa.
          </h2>
          <p style={{fontSize:15,color:C.muted,maxWidth:500,margin:"0 auto"}}>
            Do registro do paciente ao painel do psicólogo — veja como funciona na prática.
          </p>
        </Section>

        {/* BLOCO 1: App */}
        <div style={{display:"flex",flexDirection:"column",gap:80}}>

          <Section>
            <div style={{display:"flex",gap:48,alignItems:"center",flexWrap:"wrap",justifyContent:"center"}}>
              <div style={{flex:1,minWidth:260,maxWidth:420}}>
                <div style={{fontSize:11,color:C.blue,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:14}}>📱 Passo 1 — App do Paciente</div>
                <h3 style={{fontSize:"clamp(22px,3vw,32px)",fontWeight:900,letterSpacing:"-0.5px",marginBottom:16,lineHeight:1.2}}>30 segundos.<br/><span style={{color:C.blue}}>Humor, contexto, desabafo.</span></h3>
                <p style={{fontSize:14,color:C.muted,lineHeight:1.75,marginBottom:20}}>O paciente seleciona como está se sentindo, marca os gatilhos do dia e pode deixar um texto ou áudio de até 30 segundos. Em dias difíceis, o app sugere automaticamente um exercício de respiração calibrado para o estado emocional.</p>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {[{i:"😊",t:"Seleção de humor com 6 emoções + campo livre"},
                    {i:"🏷️",t:"Tags de contexto: trabalho, relação, família e mais"},
                    {i:"🫁",t:"Respiração guiada contextual (4-7-8, Quadrada, etc)"}].map(function(item){
                    return(<div key={item.t} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                      <span style={{fontSize:16,flexShrink:0,marginTop:1}}>{item.i}</span>
                      <span style={{fontSize:13,color:C.hi,lineHeight:1.5}}>{item.t}</span>
                    </div>);
                  })}
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"center",animation:"mlFloat 4s ease-in-out infinite"}}>
                <AppMockup/>
              </div>
            </div>
          </Section>

          {/* BLOCO 2: áudio + texto */}
          <Section delay={0.1}>
            <div style={{display:"flex",gap:48,alignItems:"center",flexWrap:"wrap",justifyContent:"center",flexDirection:"row-reverse"}}>
              <div style={{flex:1,minWidth:260,maxWidth:420}}>
                <div style={{fontSize:11,color:C.purple,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:14}}>🎙 Passo 2 — Texto & Áudio</div>
                <h3 style={{fontSize:"clamp(22px,3vw,32px)",fontWeight:900,letterSpacing:"-0.5px",marginBottom:16,lineHeight:1.2}}>O que ele não consegue<br/><span style={{color:C.purple}}>dizer na sessão.</span></h3>
                <p style={{fontSize:14,color:C.muted,lineHeight:1.75,marginBottom:20}}>Textos escritos e áudios de desabafo ficam vinculados ao registro emocional do dia. O psicólogo tem acesso completo antes da sessão — sem precisar perguntar "como foi sua semana?"</p>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {[{i:"✏️",t:"Campo de texto livre com até 280 caracteres"},
                    {i:"🎙",t:"Áudio de desabafo opcional com player visual"},
                    {i:"🔒",t:"Criptografia end-to-end em todos os dados"}].map(function(item){
                    return(<div key={item.t} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                      <span style={{fontSize:16,flexShrink:0,marginTop:1}}>{item.i}</span>
                      <span style={{fontSize:13,color:C.hi,lineHeight:1.5}}>{item.t}</span>
                    </div>);
                  })}
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"center",animation:"mlFloat 4s ease-in-out infinite 1s"}}>
                <MediaMockup/>
              </div>
            </div>
          </Section>

          {/* BLOCO 3: painel */}
          <Section delay={0.1}>
            <div style={{display:"flex",gap:48,alignItems:"center",flexWrap:"wrap",justifyContent:"center"}}>
              <div style={{flex:1,minWidth:260,maxWidth:420}}>
                <div style={{fontSize:11,color:C.sage,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:14}}>🖥️ Passo 3 — Painel do Psicólogo</div>
                <h3 style={{fontSize:"clamp(22px,3vw,32px)",fontWeight:900,letterSpacing:"-0.5px",marginBottom:16,lineHeight:1.2}}>3 minutos de leitura.<br/><span style={{color:C.sage}}>Sessão transformada.</span></h3>
                <p style={{fontSize:14,color:C.muted,lineHeight:1.75,marginBottom:20}}>Antes de cada sessão, você tem acesso a um painel completo: gráfico de humor dos últimos 30 dias, alertas automáticos de risco, nuvem de gatilhos e os desabafos reais da semana — tudo organizado, sem precisar ler mensagens de WhatsApp.</p>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {[{i:"📈",t:"Linha do humor com pontos de risco destacados"},
                    {i:"🔴",t:"Alertas automáticos para picos fora do padrão"},
                    {i:"📊",t:"Gatilhos mais frequentes com ranking visual"}].map(function(item){
                    return(<div key={item.t} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                      <span style={{fontSize:16,flexShrink:0,marginTop:1}}>{item.i}</span>
                      <span style={{fontSize:13,color:C.hi,lineHeight:1.5}}>{item.t}</span>
                    </div>);
                  })}
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"center",animation:"mlFloat 4s ease-in-out infinite 2s"}}>
                <DoctorMockup/>
              </div>
            </div>
          </Section>

        </div>
      </section>

      {/* PLANOS */}
      <section style={{background:C.surface,borderTop:"1px solid "+C.border,borderBottom:"1px solid "+C.border,padding:"96px 24px"}}>
        <div style={{maxWidth:780,margin:"0 auto"}}>
          <Section style={{textAlign:"center",marginBottom:56}}>
            <div style={{fontSize:12,color:C.sage,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>Plano</div>
            <h2 style={{fontSize:"clamp(28px,4vw,44px)",fontWeight:900,letterSpacing:"-1px",marginBottom:16}}>
              Simples. Sem surpresas.<br/><span style={{color:C.sage}}>Um plano, tudo incluso.</span>
            </h2>
  
          </Section>

          <div style={{display:"grid",gridTemplateColumns:"1fr",gap:20,maxWidth:400,margin:"0 auto"}}>
            {[
              {name:"Individual",price:"R$97",period:"/mês",color:C.blue,icon:"👤",badge:null,features:["Pacientes ilimitados","Heatmap emocional semanal","Alertas automáticos de risco","Exercícios de respiração guiada","Histórico completo (12 meses)","Suporte via chat"]},
            ].map(function(plan,i){
              return(
                <Section key={plan.name} delay={i*.1}>
                  <div className="mlCard" style={{background:C.card,border:"1px solid "+(i===1?"rgba(74,222,128,0.3)":C.border),borderRadius:20,padding:28,height:"100%",display:"flex",flexDirection:"column",position:"relative",boxShadow:i===1?"0 0 32px rgba(74,222,128,0.1)":"none"}}>
                    {plan.badge&&<div style={{position:"absolute",top:16,right:16,background:C.sageMid,color:"white",fontSize:9,fontWeight:700,padding:"3px 10px",borderRadius:20}}>{plan.badge}</div>}
                    <div style={{width:36,height:36,borderRadius:10,background:plan.color+"18",border:"1px solid "+plan.color+"33",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,marginBottom:14}}>{plan.icon}</div>
                    <div style={{fontSize:12,fontWeight:700,color:plan.color,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{plan.name}</div>
                    <div style={{marginBottom:20}}>
                      <span style={{fontSize:38,fontWeight:900,color:C.white}}>{plan.price}</span>
                      <span style={{fontSize:13,color:C.muted}}>{plan.period}</span>
                    </div>
                    <div style={{flex:1}}>
                      {plan.features.map(function(f){return(
                        <div key={f} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:9}}>
                          <span style={{color:plan.color,fontSize:11,marginTop:1,flexShrink:0}}>✓</span>
                          <span style={{fontSize:12,color:C.hi,lineHeight:1.5}}>{f}</span>
                        </div>
                      );})}
                    </div>
                    <a href="#cta" style={{marginTop:20,display:"block",textAlign:"center",background:i===1?"linear-gradient(135deg,"+C.sageMid+","+C.blueMid+")":"rgba(255,255,255,0.06)",border:i===1?"none":"1px solid "+C.border,borderRadius:12,padding:"12px",color:"white",fontWeight:700,fontSize:13,textDecoration:"none",boxShadow:i===1?"0 0 24px rgba(74,222,128,0.3)":"none"}}>
                      Entrar na lista beta
                    </a>
                  </div>
                </Section>
              );
            })}
          </div>

          <Section delay={0.25} style={{marginTop:20,textAlign:"center"}}>
            <div style={{fontSize:13,color:C.muted,background:C.card,border:"1px solid "+C.border,borderRadius:12,padding:"14px 20px",display:"inline-block",lineHeight:1.7}}>
              💡 <strong style={{color:C.white}}>Por que R$97?</strong> É menos que duas sessões por mês. Se o app economiza 10 minutos de preparação por sessão e você atende 20 pacientes por semana — ele se paga no primeiro dia do mês.
            </div>
          </Section>
        </div>
      </section>

      {/* FAQ */}
      <section style={{maxWidth:680,margin:"0 auto",padding:"96px 24px"}}>
        <Section style={{textAlign:"center",marginBottom:56}}>
          <div style={{fontSize:12,color:C.sage,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>FAQ</div>
          <h2 style={{fontSize:"clamp(28px,4vw,44px)",fontWeight:900,letterSpacing:"-1px"}}>Perguntas frequentes</h2>
        </Section>
        <Section>
          <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:20,padding:"8px 28px"}}>
            {[
              {q:"O MindBridge substitui a terapia?",a:"Não. É uma ferramenta de suporte entre sessões — não um substituto. Ele existe para enriquecer a relação terapêutica com dados reais, não para criar dependência tecnológica no processo clínico."},
              {q:"Os dados dos pacientes são seguros?",a:"Sim. Toda a arquitetura é construída com privacy-by-design: criptografia end-to-end nos áudios e textos, consentimento explícito no onboarding e conformidade total com a LGPD. Dados de saúde mental são tratados como dados sensíveis (Art. 11)."},
              {q:"Como o paciente acessa o app?",a:"O psicólogo cadastra o paciente no painel e gera um link único. O paciente instala o app pelo link e já começa a usar sem criar conta manualmente. Simples e rápido."},
              {q:"Quando o beta vai abrir?",a:"O beta privado está previsto para abrir nas próximas semanas. Os primeiros da lista terão acesso gratuito por 3 meses e poderão influenciar diretamente o desenvolvimento do produto."},
              {q:"O áudio de desabafo fica salvo onde?",a:"Os áudios ficam armazenados com criptografia em servidores seguros e só podem ser acessados pelo psicólogo vinculado ao paciente. Nenhum outro usuário ou colaborador da plataforma tem acesso."},
              {q:"Funciona para qualquer abordagem terapêutica?",a:"Sim. As frases motivacionais e intervenções podem ser configuradas para TCC, Mindfulness, Fenomenologia ou Psicanálise. O produto se adapta à abordagem do profissional, não o contrário."},
            ].map(function(item){return <FaqItem key={item.q} q={item.q} a={item.a}/>;}) }
          </div>
        </Section>
      </section>

      {/* CTA */}
      <section id="cta" style={{background:C.surface,borderTop:"1px solid "+C.border,padding:"96px 24px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",width:700,height:700,borderRadius:"50%",background:"radial-gradient(circle,rgba(74,222,128,0.05) 0%,transparent 70%)",top:"50%",left:"50%",transform:"translate(-50%,-50%)",pointerEvents:"none"}}/>
        <div style={{maxWidth:500,margin:"0 auto",position:"relative"}}>
          <Section style={{textAlign:"center",marginBottom:40}}>
            <div style={{fontSize:40,marginBottom:16,animation:"mlFloat 3s ease-in-out infinite"}}>🚀</div>
            <h2 style={{fontSize:"clamp(28px,4vw,44px)",fontWeight:900,letterSpacing:"-1px",marginBottom:16}}>
              Seja um dos primeiros<br/><span style={{color:C.sage}}>a transformar sessões.</span>
            </h2>
            <p style={{fontSize:15,color:C.muted,lineHeight:1.7}}>Vagas limitadas para o beta privado. Sua opinião vai moldar o produto.</p>
          </Section>
          <Section delay={0.15}>
            <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:20,padding:32}}>
              <LeadForm onSuccess={handleLead}/>
            </div>
          </Section>
          <Section delay={0.25} style={{marginTop:28,display:"flex",justifyContent:"center",gap:28,flexWrap:"wrap"}}>
            {["🔒 LGPD compliant","📵 Zero spam","✓ Cancele quando quiser"].map(function(t){return <div key={t} style={{fontSize:12,color:C.muted}}>{t}</div>;})}
          </Section>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{borderTop:"1px solid "+C.border,padding:"40px 24px",textAlign:"center"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:12}}>
          <div style={{width:24,height:24,borderRadius:6,background:"linear-gradient(135deg,"+C.sageMid+","+C.blueMid+")",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>🧠</div>
          <span style={{fontWeight:800,fontSize:15}}>Mind<span style={{color:C.sage}}>Bridge</span></span>
        </div>
        <p style={{fontSize:12,color:C.muted,lineHeight:1.7,maxWidth:460,margin:"0 auto 16px"}}>A ponte inteligente entre psicólogos e pacientes.<br/>Construído para conectar. Projetado para cuidar.</p>
        <div style={{fontSize:11,color:C.border}}>© 2026 MindBridge · Todos os direitos reservados</div>
      </footer>
    </div>
  );
}
