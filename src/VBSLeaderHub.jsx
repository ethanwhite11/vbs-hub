import { useState, useEffect, createContext, useContext } from "react"
import { Calendar, Coffee, Users, Home, ChevronDown, ChevronRight, RefreshCw } from "lucide-react"

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const GCSS = `
  @keyframes splashIn   { 0%{opacity:0;transform:scale(0.5)} 60%{opacity:1;transform:scale(1.08)} 80%{transform:scale(0.96)} 100%{transform:scale(1)} }
  @keyframes splashText { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes tabFade    { from{opacity:0;transform:scale(0.99) translateY(4px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes fadeUp     { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes livePulse  { 0%,100%{opacity:1} 50%{opacity:0.35} }
  * { -webkit-tap-highlight-color:transparent; box-sizing:border-box; }
  body { overscroll-behavior:none; margin:0; background:#f5f5f5; }
  button { font-family:inherit; }
  ::-webkit-scrollbar { width:0; }
`

// ─── THEME ────────────────────────────────────────────────────────────────────
const TH = {
  bg:'#f5f5f5', surface:'#ffffff', surfaceHi:'#f0f0f0',
  border:'#e8e8e8',
  accent:'#16a34a', accentBg:'rgba(22,163,74,0.09)', accentBdr:'rgba(22,163,74,0.28)',
  brand:'#16a34a', brandBg:'rgba(22,163,74,0.09)', brandBdr:'rgba(22,163,74,0.28)',
  text:'#111111', muted:'#888888', mutedLt:'#aaaaaa',
  green:'#16a34a', greenBg:'rgba(22,163,74,0.09)',
  navBg:'#ffffff',
  banBg:'#16a34a', banBdr:'rgba(22,163,74,0.30)',
  track:'rgba(0,0,0,0.09)',
}
const TC = createContext(TH)
const useC = () => useContext(TC)

// ─── GROUPS ───────────────────────────────────────────────────────────────────
const GROUPS = {
  red:    { color:'#E05252', bg:'rgba(224,82,82,0.10)',   dark:'rgba(224,82,82,0.18)',   label:'Red',    short:'Red' },
  yellow: { color:'#D4A017', bg:'rgba(212,160,23,0.10)',  dark:'rgba(212,160,23,0.18)',  label:'Yellow', short:'Yel' },
  green:  { color:'#38A85A', bg:'rgba(56,168,90,0.10)',   dark:'rgba(56,168,90,0.18)',   label:'Green',  short:'Grn' },
  blue:   { color:'#3B82F6', bg:'rgba(59,130,246,0.10)',  dark:'rgba(59,130,246,0.18)',  label:'Blue',   short:'Blu' },
  purple: { color:'#9B5CF6', bg:'rgba(155,92,246,0.10)',  dark:'rgba(155,92,246,0.18)',  label:'Purple', short:'Pur' },
  orange: { color:'#F97316', bg:'rgba(249,115,22,0.10)',  dark:'rgba(249,115,22,0.18)',  label:'Orange · Preschool', short:'Pre' },
}

// ─── SCHEDULE DATA ────────────────────────────────────────────────────────────
const SLOTS = [
  { start:[9,0],   end:[9,25],  label:'Sing & Play Tune Lagoon', emoji:'🎵', allGroups:true,  location:'Auditorium' },
  { start:[9,30],  end:[9,50],  label:'Station Rotation',        emoji:'🔄', isRotation:true, rotIdx:0 },
  { start:[9,55],  end:[10,15], label:'Station Rotation',        emoji:'🔄', isRotation:true, rotIdx:1 },
  { start:[10,20], end:[10,40], label:'Station Rotation',        emoji:'🔄', isRotation:true, rotIdx:2 },
  { start:[10,45], end:[11,5],  label:'Station Rotation',        emoji:'🔄', isRotation:true, rotIdx:3 },
  { start:[11,10], end:[11,30], label:'Station Rotation',        emoji:'🔄', isRotation:true, rotIdx:4 },
  { start:[11,35], end:[12,0],  label:'Canopy Closing',          emoji:'🌿', allGroups:true,  location:'Auditorium' },
]

const ROT = {
  blue:   [{s:'Rooted Bible Adventures',      l:'Chapel'},{s:'Missions',l:'West Wing'},{s:'Treetop Treats / Imagination',l:'Pearson Fellowship Hall'},{s:'Wild Games',l:'Field / Gym'},{s:'Worship',l:'Auditorium'}],
  yellow: [{s:'Worship',                      l:'Auditorium'},{s:'Rooted Bible Adventures',l:'Chapel'},{s:'Missions',l:'West Wing'},{s:'Treetop Treats / Imagination',l:'Pearson Fellowship Hall'},{s:'Wild Games',l:'Field / Gym'}],
  red:    [{s:'Wild Games',                   l:'Field / Gym'},{s:'Worship',l:'Auditorium'},{s:'Rooted Bible Adventures',l:'Chapel'},{s:'Missions',l:'West Wing'},{s:'Treetop Treats / Imagination',l:'Pearson Fellowship Hall'}],
  green:  [{s:'Treetop Treats / Imagination', l:'Pearson Fellowship Hall'},{s:'Wild Games',l:'Field / Gym'},{s:'Worship',l:'Auditorium'},{s:'Rooted Bible Adventures',l:'Chapel'},{s:'Missions',l:'West Wing'}],
  purple: [{s:'Missions',                     l:'West Wing'},{s:'Treetop Treats / Imagination',l:'Pearson Fellowship Hall'},{s:'Wild Games',l:'Field / Gym'},{s:'Worship',l:'Auditorium'},{s:'Rooted Bible Adventures',l:'Chapel'}],
  orange: [{s:'Paradise Preschool',           l:'West Wing / Nursery'},{s:'Paradise Preschool',l:'West Wing / Nursery'},{s:'Paradise Preschool',l:'West Wing / Nursery'},{s:'Paradise Preschool',l:'West Wing / Nursery'},{s:'Paradise Preschool',l:'West Wing / Nursery'}],
}

// ─── DAILY DATA ───────────────────────────────────────────────────────────────
const DAYS = [
  { n:1,date:'2026-07-13',label:'Mon · July 13',point:'God is our creator.',passage:'Genesis 1',verseRef:'Psalm 103:22',verseText:'"Let everything he has created praise the Lord, for he has given the order."',buddy:'Tango 🦜',accentColor:'#F0B429',icebreaker:"What's the coolest thing God made that you've ever seen in nature?",reminders:['Introduce yourself to every kid in your group today','Help your crew come up with a name or cheer','Watch for God Sightings — share one of yours first to model it','Response to Bible Point: "Wow, God!" — model it before they echo it','Encourage every kid to write their first God Sighting'] },
  { n:2,date:'2026-07-14',label:'Tue · July 14',point:'God knows everything.',passage:'Psalm 139',verseRef:'Psalm 139:1',verseText:'"O Lord, you have examined my heart and know everything about me."',buddy:'Seymour 🦎',accentColor:'#9B5CF6',icebreaker:"What's something surprising about yourself that most people don't know?",reminders:["You should know every kid's name by now — use them constantly","Connect today's point to God Sightings from yesterday",'Affirm kids who were brave enough to share yesterday','Check in: is anyone having a hard time so far?','Keep crew transitions tight — things should be running smoother'] },
  { n:3,date:'2026-07-15',label:'Wed · July 15',point:'God is our safe place.',passage:'1 Samuel 23–24',verseRef:'Psalm 142:5',verseText:'"Then I pray to you, O Lord. I say, \'You are my place of refuge.\'"',buddy:'Dottie 🐦',accentColor:'#3B82F6',icebreaker:"Where's your favorite place to go when you need to feel safe or calm?",reminders:["Hump day — energy may dip. Keep transitions fun and snappy","The 'safe place' theme lands deep for some kids — stay emotionally present",'Pull aside a quieter kid and check in one-on-one','Remind your crew they can always come to you if something feels wrong','Celebrate God Sightings loudly — the habit is forming'] },
  { n:4,date:'2026-07-16',label:'Thu · July 16',point:'God is love.',passage:'Luke 22:39–24:12',verseRef:'Psalm 136:1',verseText:'"Give thanks to the Lord, for he is good! His faithful love endures forever."',buddy:'Tia 🦋',accentColor:'#E05252',icebreaker:"What's the nicest thing someone has done for you?",reminders:["One more day after this — make every moment count","Go out of your way for any kid who's been on the fringe all week",'Operation Kid-to-Kid giving — encourage generosity, never pressure','Write a personal encouragement note to each kid in your group','Finish strong — the last impression matters as much as the first'] },
  { n:5,date:'2026-07-17',label:'Fri · July 17',point:'God is forever.',passage:'Revelation 7:17; 21–22',verseRef:'Psalm 115:18',verseText:'"But we will bless the Lord both now and forever. Praise the Lord!"',buddy:'Howie 🦗',accentColor:'#4ACC80',icebreaker:"If you could do one thing forever, what would it be?",reminders:['Last day — make it unforgettable for every kid in your group','Families join Canopy Closing today — help your crew shine','Personally affirm each kid before they leave','Collect any remaining God Sightings for the display board','Thank your team and celebrate what God did this week'] },
]

// ─── COFFEE ───────────────────────────────────────────────────────────────────
const MENU = {
  hot:  { label:'Hot',  emoji:'☕', items:['Americano','Latte / Cappuccino','Almond Milk Latte','Breve Latte','Mocha','Caramel Machiatto','Chai Tea Latte','London Fog','Hot Chocolate'] },
  cold: { label:'Cold', emoji:'🧊', items:['Italian Soda','Joe Chill','Chai Chill','Fruit Smoothie'] },
}
const EXTRAS = ['Extra Shot of Espresso','Extra Shot of Syrup','Bottled Water','Hot Tea','Biscotti','Trail Mix','Mentos']
const SIZES = ['8 oz','12 oz','16 oz']
const COFFEE_NUM = '7276880591'

// ─── CREW CONTENT ─────────────────────────────────────────────────────────────
const JOKES = [
  {q:"Why don't monkeys ever play cards in the jungle?",a:"Too many cheetahs!"},
  {q:"What do you call a sleeping dinosaur?",a:"A dino-snore!"},
  {q:"How do trees access the internet?",a:"They log in!"},
  {q:"Why did the frog take the bus to work?",a:"His car got toad!"},
  {q:"What do you get when you cross a parrot and a centipede?",a:"A walkie talkie!"},
  {q:"What do you call a lazy kangaroo?",a:"A pouch potato!"},
  {q:"Why did the lion spit out the clown?",a:"Because he tasted funny!"},
  {q:"What's a monkey's favorite cookie?",a:"Chocolate chimp!"},
  {q:"Why did the jaguar refuse the map?",a:"Because he always found his own prey!"},
  {q:"What do you call a snake that works for the government?",a:"A civil serpent!"},
]

const FACTS = [
  "The Amazon rainforest produces about 20% of the world's oxygen — it's called the lungs of the Earth.",
  "There are more species of fish in the Amazon River than in the entire Atlantic Ocean.",
  "A typical 4-square-mile patch of rainforest contains 400 species of birds.",
  "Rainforests are so dense it can take 10 minutes for rain to reach the forest floor after falling.",
  "The poison dart frog gets its toxins from its diet. In captivity, they become non-toxic over time.",
  "A toucan's beak can be half the length of its body — but it's actually very lightweight inside.",
  "The capybara is the world's largest rodent and loves to swim. It can even sleep in water.",
  "The sloth moves so slowly that algae grows on its fur, which helps it blend into the trees.",
  "Leafcutter ants can carry 50 times their own body weight.",
  "Over 25% of modern medicines come from plants found in the rainforest.",
  "The harpy eagle has talons as large as a grizzly bear's claws and can carry prey its own size.",
  "Some rainforest trees live for over 1,000 years.",
]

const TIPS = [
  {icon:"🚶",tip:"Walk behind your group during transitions. No kid should be out of your line of sight."},
  {icon:"📛",tip:"Know every kid's name by Day 2. Use names constantly — kids pay attention when they feel known."},
  {icon:"👁️",tip:"Get down to eye level when a kid is struggling. It changes the entire dynamic of the conversation."},
  {icon:"⏱️",tip:"If a transition gets chaotic, use a countdown: '5, 4, 3, 2, 1 — freeze!' It works every single time."},
  {icon:"⚡",tip:"Your energy is contagious. If you're bored, they're bored. If you're locked in, they're locked in."},
  {icon:"💛",tip:"The kid acting out the most is usually the one who needs the most connection. Stay curious, not frustrated."},
  {icon:"🙌",tip:'"Wow, God!" works best when YOU say it like you mean it. Lead the response — then they echo it.'},
  {icon:"👀",tip:"At Canopy Closing, position yourself so you can see every kid in your crew and make eye contact."},
  {icon:"🌿",tip:"Help kids find their own God Sighting each day. Ask 'Where did you see God today?' at the start of crew time."},
  {icon:"💪",tip:"If a kid has a rough moment, pull them aside gently and check in quietly. Don't make it a scene."},
]

// ─── UTILITIES ────────────────────────────────────────────────────────────────
const toMin = ([h,m]) => h*60+m

function fmtTime([h,m]) {
  const ap = h >= 12 ? 'PM' : 'AM'
  const h12 = h > 12 ? h-12 : h === 0 ? 12 : h
  return `${h12}:${String(m).padStart(2,'0')} ${ap}`
}

function getVbsDay(now) {
  const p = n => String(n).padStart(2,'0')
  const today = `${now.getFullYear()}-${p(now.getMonth()+1)}-${p(now.getDate())}`
  return DAYS.findIndex(d => d.date === today)
}

function getLive(now) {
  const dayIdx = getVbsDay(now)
  const cur = now.getHours()*60 + now.getMinutes()
  const first = toMin(SLOTS[0].start)
  const last  = toMin(SLOTS[SLOTS.length-1].end)
  if (dayIdx === -1) {
    return { status: now < new Date('2026-07-13') ? 'countdown' : 'done', dayIdx }
  }
  if (cur < first) return { status:'before', dayIdx, minUntil: first-cur }
  if (cur >= last) return { status:'after', dayIdx }
  for (let i=0; i<SLOTS.length; i++) {
    const s = toMin(SLOTS[i].start), e = toMin(SLOTS[i].end)
    if (cur >= s && cur < e) return { status:'live', dayIdx, slot:SLOTS[i], slotIdx:i, minIn:cur-s, minLeft:e-cur, duration:e-s, progress:(cur-s)/(e-s), next:SLOTS[i+1]||null }
  }
  return { status:'done', dayIdx }
}

function getActivity(g, slotIdx) {
  const slot = SLOTS[slotIdx]
  if (!slot) return null
  if (slot.allGroups) return { s:slot.label, l:slot.location }
  if (slot.isRotation) return ROT[g]?.[slot.rotIdx] || null
  return null
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function Tap({ onClick, children, style, disabled }) {
  const [p, setP] = useState(false)
  return (
    <div onClick={disabled ? undefined : onClick}
      onPointerDown={() => !disabled && setP(true)}
      onPointerUp={() => setP(false)} onPointerCancel={() => setP(false)} onPointerLeave={() => setP(false)}
      style={{ ...style, cursor:disabled?'default':'pointer', userSelect:'none', WebkitUserSelect:'none', opacity:disabled?0.4:1, transform:p?'scale(0.97)':'scale(1)', transition:p?'transform 0.07s ease':'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}>
      {children}
    </div>
  )
}

function SCard({ children, style }) {
  const C = useC()
  return <div style={{ background:C.surface, borderRadius:12, border:`1px solid ${C.border}`, padding:'14px 16px', marginBottom:10, ...style }}>{children}</div>
}

function SecLabel({ children }) {
  const C = useC()
  return <p style={{ margin:'20px 0 8px', fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:C.muted }}>{children}</p>
}

function Bar({ pct, color }) {
  const C = useC()
  return <div style={{ height:3, background:C.track, borderRadius:99, overflow:'hidden' }}><div style={{ height:'100%', width:`${Math.min(100,Math.max(0,pct*100))}%`, background:color, borderRadius:99, transition:'width 30s linear' }} /></div>
}

// ─── SPLASH ───────────────────────────────────────────────────────────────────
function Splash({ onDone }) {
  const [out,setOut] = useState(false)
  const [logoErr,setLogoErr] = useState(false)
  useEffect(() => { const t1=setTimeout(()=>setOut(true),1600),t2=setTimeout(onDone,2100); return()=>{clearTimeout(t1);clearTimeout(t2)} },[])
  return (
    <div style={{ position:'fixed',inset:0,zIndex:1000,background:'#0d1f15',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',opacity:out?0:1,transition:out?'opacity 0.5s ease':'none' }}>
      {logoErr
        ? <div style={{ fontSize:88,animation:'splashIn 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>🌿</div>
        : <img src="/rf-logo.png" alt="Rainforest Falls" onError={()=>setLogoErr(true)} style={{ width:220,height:220,objectFit:'contain',animation:'splashIn 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards',marginBottom:4 }} />
      }
      <p style={{ margin:'8px 0 4px',fontSize:12,fontWeight:700,letterSpacing:'0.16em',textTransform:'uppercase',color:'#16a34a',animation:'splashText 0.5s ease 0.5s both' }}>Gateway Church · VBS 2026</p>
      <p style={{ margin:0,fontSize:20,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:'#6b7280',animation:'splashText 0.5s ease 0.7s both' }}>Leader Hub</p>
    </div>
  )
}

// ─── GROUP PICKER ─────────────────────────────────────────────────────────────
function GroupPicker({ onSelect }) {
  const C = useC()
  const [sel,setSel] = useState(null)
  return (
    <div style={{ minHeight:'100vh',background:C.bg,display:'flex',flexDirection:'column',padding:'calc(52px + env(safe-area-inset-top,0px)) 20px calc(40px + env(safe-area-inset-bottom,0px))',animation:'fadeUp 0.4s ease both' }}>
      <div style={{ marginBottom:28 }}>
        <p style={{ margin:'0 0 2px',fontSize:11,fontWeight:600,letterSpacing:'0.10em',textTransform:'uppercase',color:C.muted }}>Rainforest Falls VBS 2026</p>
        <h1 style={{ margin:'0 0 10px',fontSize:32,fontWeight:700,color:C.text,lineHeight:1 }}>Select Your Group</h1>
        <p style={{ margin:0,fontSize:14,color:C.muted,lineHeight:1.5 }}>Choose your color group to personalize your schedule view.</p>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,flex:1 }}>
        {Object.entries(GROUPS).map(([key,g]) => (
          <Tap key={key} onClick={()=>setSel(key)} style={{ background:sel===key?g.dark:C.surface,border:`2px solid ${sel===key?g.color:C.border}`,borderRadius:18,padding:'22px 14px',textAlign:'center' }}>
            <div style={{ width:44,height:44,borderRadius:'50%',background:g.color,margin:'0 auto 12px',boxShadow:sel===key?`0 0 18px ${g.color}50`:'none' }} />
            <p style={{ margin:0,fontSize:14,fontWeight:700,color:sel===key?g.color:C.text,lineHeight:1.3 }}>{g.label}</p>
          </Tap>
        ))}
      </div>
      <Tap onClick={()=>sel&&onSelect(sel)} disabled={!sel} style={{ marginTop:20,padding:'15px',borderRadius:14,textAlign:'center',background:sel?GROUPS[sel].color:C.surfaceHi }}>
        <span style={{ fontSize:15,fontWeight:700,color:sel?'#fff':C.muted }}>
          {sel?`I'm on the ${GROUPS[sel].label} group`:'Select a group above'}
        </span>
      </Tap>
    </div>
  )
}

// ─── GROUP CHANGE MODAL ───────────────────────────────────────────────────────
function GroupModal({ myGroup, onSelect, onClose }) {
  const C = useC()
  return (
    <div onClick={onClose} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.35)',zIndex:200,display:'flex',alignItems:'flex-end' }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.surface,width:'100%',borderRadius:'22px 22px 0 0',padding:`22px 18px calc(24px + env(safe-area-inset-bottom,0px))`,border:`1px solid ${C.border}` }}>
        <p style={{ margin:'0 0 14px',fontSize:18,fontWeight:700,color:C.text }}>Change Group</p>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12 }}>
          {Object.entries(GROUPS).map(([key,g]) => (
            <Tap key={key} onClick={()=>{onSelect(key);onClose()}} style={{ padding:'12px',borderRadius:10,background:myGroup===key?g.bg:C.bg,border:`1.5px solid ${myGroup===key?g.color:C.border}`,display:'flex',alignItems:'center',gap:8 }}>
              <div style={{ width:10,height:10,borderRadius:'50%',background:g.color,flexShrink:0 }} />
              <span style={{ fontSize:12,fontWeight:700,color:myGroup===key?g.color:C.text }}>{g.label}</span>
            </Tap>
          ))}
        </div>
        <Tap onClick={onClose} style={{ padding:'11px',borderRadius:10,border:`1px solid ${C.border}`,textAlign:'center' }}>
          <span style={{ fontSize:14,color:C.muted }}>Cancel</span>
        </Tap>
      </div>
    </div>
  )
}

// ─── NOW HERO ─────────────────────────────────────────────────────────────────
function NowHero({ myGroup, live }) {
  const C = useC()
  const g = myGroup ? GROUPS[myGroup] : null

  const cardBase = { background:C.surface, borderRadius:16, border:`1px solid ${C.border}`, padding:'18px 20px' }

  if (live.status === 'countdown') return (
    <div style={cardBase}>
      <p style={{ margin:'0 0 4px',fontSize:12,fontWeight:600,color:C.muted }}>VBS Status</p>
      <p style={{ margin:0,fontSize:20,fontWeight:700,color:C.text }}>July 13–17 · Coming Soon 🌿</p>
    </div>
  )

  if (live.status === 'done') return (
    <div style={cardBase}>
      <p style={{ margin:0,fontSize:18,fontWeight:600,color:C.muted }}>VBS 2026 complete. See you next year 🌿</p>
    </div>
  )

  if (live.status === 'before') return (
    <div style={cardBase}>
      <div style={{ display:'flex',alignItems:'center',gap:6,marginBottom:8 }}>
        <div style={{ width:6,height:6,borderRadius:'50%',background:C.green,animation:'livePulse 2s ease infinite' }} />
        <span style={{ fontSize:10,fontWeight:700,color:C.green,letterSpacing:'.08em',textTransform:'uppercase' }}>
          Today · {live.dayIdx>=0 ? DAYS[live.dayIdx].label : ''}
        </span>
      </div>
      <p style={{ margin:0,fontSize:20,fontWeight:700,color:C.text }}>Program starts in {live.minUntil} min</p>
    </div>
  )

  if (live.status === 'after') return (
    <div style={cardBase}>
      <p style={{ margin:'0 0 4px',fontSize:11,fontWeight:600,color:C.muted,textTransform:'uppercase',letterSpacing:'.06em' }}>
        {live.dayIdx>=0 ? DAYS[live.dayIdx].label : ''}
      </p>
      <p style={{ margin:0,fontSize:20,fontWeight:600,color:C.muted }}>Program wrapped for today</p>
    </div>
  )

  const { slot, slotIdx, minLeft, progress, next } = live
  const myAct = myGroup ? getActivity(myGroup, slotIdx) : null
  const nextIdx = next ? SLOTS.indexOf(next) : -1
  const nextAct = myGroup && nextIdx>=0 ? getActivity(myGroup, nextIdx) : null
  const nextLabel = next ? (next.allGroups ? next.label : nextAct?.s || 'Station Rotation') : null

  return (
    <div style={{ background:C.accent, borderRadius:16, padding:'16px 18px' }}>
      <div style={{ display:'flex',alignItems:'center',gap:6,marginBottom:10 }}>
        <div style={{ width:6,height:6,borderRadius:'50%',background:'rgba(255,255,255,0.8)',animation:'livePulse 2s ease infinite' }} />
        <span style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.8)',letterSpacing:'.08em',textTransform:'uppercase' }}>
          Live Now · {DAYS[live.dayIdx].label}
        </span>
        {g && <span style={{ marginLeft:'auto',fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.7)',background:'rgba(255,255,255,0.15)',borderRadius:20,padding:'2px 8px' }}>{g.label.split(' ')[0]}</span>}
      </div>
      {myAct ? (
        <>
          <p style={{ margin:'0 0 4px',fontSize:26,fontWeight:800,color:'#fff',lineHeight:1.1 }}>{myAct.s}</p>
          <p style={{ margin:'0 0 14px',fontSize:13,color:'rgba(255,255,255,0.8)' }}>📍 {myAct.l}</p>
          <div style={{ height:3,background:'rgba(255,255,255,0.25)',borderRadius:99,overflow:'hidden',marginBottom:8 }}>
            <div style={{ height:'100%',width:`${Math.min(100,Math.max(0,progress*100))}%`,background:'#fff',borderRadius:99,transition:'width 30s linear' }} />
          </div>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
            <span style={{ fontSize:12,color:'rgba(255,255,255,0.85)',fontWeight:600 }}>{minLeft} min left</span>
            {next && <span style={{ fontSize:11,color:'rgba(255,255,255,0.65)' }}>Next: {nextLabel} · {fmtTime(next.start)}</span>}
          </div>
        </>
      ) : (
        <>
          <p style={{ margin:'0 0 4px',fontSize:22,fontWeight:700,color:'#fff' }}>
            {slot.allGroups ? slot.label : 'Station Rotation'}
          </p>
          {slot.allGroups && <p style={{ margin:0,fontSize:13,color:'rgba(255,255,255,0.8)' }}>📍 {slot.location} · All Groups</p>}
        </>
      )}
    </div>
  )
}

// ─── TODAY PAGE ───────────────────────────────────────────────────────────────
function TodayPage({ myGroup, live, now, onViewSchedule }) {
  const C = useC()
  const dayIdx = live.dayIdx >= 0 ? live.dayIdx : (now < new Date('2026-07-13') ? 0 : DAYS.length - 1)
  const day = DAYS[dayIdx]
  const [showReminders, setShowReminders] = useState(false)
  const cur = now.getHours() * 60 + now.getMinutes()
  const inVbs = ['live','before','after'].includes(live.status)

  const upcomingSlots = SLOTS
    .map((s, i) => ({ ...s, i }))
    .filter(s => !inVbs || toMin(s.end) > cur)
    .slice(0, 3)

  const isCur = i => live.status === 'live' && live.slotIdx === i
  const isPast = s => inVbs && cur > toMin(s.end)

  return (
    <div>
      <div style={{ padding:'calc(14px + env(safe-area-inset-top,0px)) 16px 12px',borderBottom:`1px solid ${C.border}`,background:C.surface,position:'sticky',top:0,zIndex:10 }}>
        <p style={{ margin:'0 0 1px',fontSize:11,fontWeight:600,color:C.muted }}>Gateway Church · VBS 2026</p>
        <h2 style={{ margin:0,fontSize:22,fontWeight:700,color:C.text }}>Today</h2>
      </div>
      <div style={{ padding:'12px 16px calc(92px + env(safe-area-inset-bottom,0px))' }}>

        <NowHero myGroup={myGroup} live={live} />

        {/* Bible Point */}
        <div style={{ background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,padding:'16px',marginTop:10 }}>
          <p style={{ margin:'0 0 4px',fontSize:11,fontWeight:600,color:C.muted,textTransform:'uppercase',letterSpacing:'.06em' }}>Day {day.n} · Bible Point</p>
          <p style={{ margin:'0 0 10px',fontSize:20,fontWeight:700,color:C.text,lineHeight:1.2 }}>{day.point}</p>
          <span style={{ display:'inline-flex',background:C.accentBg,border:`1px solid ${C.accentBdr}`,borderRadius:8,padding:'4px 10px' }}>
            <span style={{ fontSize:12,fontWeight:700,color:C.accent }}>"Wow, God!"</span>
          </span>
        </div>

        {/* Memory Verse */}
        <div style={{ background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,borderLeft:`3px solid ${C.accent}`,padding:'14px 16px',marginTop:10 }}>
          <p style={{ margin:'0 0 6px',fontSize:14,color:C.text,lineHeight:1.6,fontStyle:'italic' }}>{day.verseText}</p>
          <p style={{ margin:0,fontSize:11,fontWeight:700,color:C.accent,textTransform:'uppercase',letterSpacing:'.06em' }}>{day.verseRef}</p>
        </div>

        {/* Icebreaker */}
        <div style={{ background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,padding:'14px 16px',marginTop:10 }}>
          <p style={{ margin:'0 0 5px',fontSize:11,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:'.06em' }}>Crew Icebreaker</p>
          <p style={{ margin:0,fontSize:14,color:C.text,lineHeight:1.55,fontStyle:'italic' }}>"{day.icebreaker}"</p>
        </div>

        {/* Mini Schedule */}
        <SecLabel>Today's Schedule</SecLabel>
        {upcomingSlots.map(slot => {
          const active = isCur(slot.i)
          const past = isPast(slot)
          const myAct = myGroup ? getActivity(myGroup, slot.i) : null
          const displayName = slot.allGroups ? slot.label : (myAct ? myAct.s : 'Station Rotation')
          const displayLoc  = slot.allGroups ? slot.location : myAct?.l
          return (
            <div key={slot.i} style={{ background:active?C.accentBg:C.surface,borderRadius:12,border:`1px solid ${active?C.accentBdr:C.border}`,padding:'11px 14px',marginBottom:8,opacity:past?0.42:1 }}>
              <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:3 }}>
                <p style={{ margin:0,fontSize:14,fontWeight:active?700:500,color:active?C.accent:C.text }}>
                  {slot.emoji} {displayName}
                </p>
                {active && <span style={{ fontSize:9,fontWeight:700,background:C.accent,color:'#fff',padding:'2px 8px',borderRadius:99,textTransform:'uppercase',letterSpacing:'.06em',flexShrink:0 }}>NOW</span>}
              </div>
              <p style={{ margin:0,fontSize:11,color:active?C.accent:C.muted }}>
                {fmtTime(slot.start)} – {fmtTime(slot.end)}{displayLoc ? ` · 📍 ${displayLoc}` : ''}
              </p>
            </div>
          )
        })}
        <button onClick={onViewSchedule} style={{ width:'100%',background:'none',border:`1px solid ${C.border}`,borderRadius:12,padding:'11px',color:C.accent,fontSize:13,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:4,marginBottom:16,background:C.surface }}>
          See full schedule <ChevronRight size={14} color={C.accent} />
        </button>

        {/* Reminders — collapsed */}
        <Tap onClick={()=>setShowReminders(p=>!p)} style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:'12px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:showReminders?8:0 }}>
          <span style={{ fontSize:14,fontWeight:600,color:C.text }}>
            Reminders for today <span style={{ color:C.muted,fontWeight:400,fontSize:13 }}>({day.reminders.length})</span>
          </span>
          <ChevronDown size={16} color={C.muted} style={{ transform:showReminders?'rotate(180deg)':'rotate(0)',transition:'transform 0.2s ease',flexShrink:0 }} />
        </Tap>
        {showReminders && day.reminders.map((r,i) => (
          <div key={i} style={{ background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,padding:'12px 14px',marginBottom:8,display:'flex',gap:12,alignItems:'flex-start' }}>
            <div style={{ width:22,height:22,borderRadius:6,background:C.accentBg,color:C.accent,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,flexShrink:0,marginTop:1,border:`1px solid ${C.accentBdr}` }}>{i+1}</div>
            <p style={{ margin:0,fontSize:14,color:C.text,lineHeight:1.55,flex:1 }}>{r}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── SCHEDULE PAGE ────────────────────────────────────────────────────────────
function SchedulePage({ myGroup, live, now }) {
  const C = useC()
  const cur = now.getHours()*60+now.getMinutes()
  const inVbs = ['live','before','after'].includes(live.status)

  return (
    <div>
      <div style={{ padding:'calc(14px + env(safe-area-inset-top,0px)) 16px 12px',borderBottom:`1px solid ${C.border}`,background:C.surface,position:'sticky',top:0,zIndex:10 }}>
        <h2 style={{ margin:'0 0 2px',fontSize:22,fontWeight:700,color:C.text }}>Schedule</h2>
        <p style={{ margin:0,fontSize:12,color:C.muted }}>July 13–17 · 9:00 AM – 12:00 PM daily</p>
      </div>
      <div style={{ padding:'12px 16px calc(92px + env(safe-area-inset-bottom,0px))' }}>
        {SLOTS.map((slot,i) => {
          const e = toMin(slot.end)
          const isCur = live.status==='live' && live.slotIdx===i
          const isPast = inVbs && cur>e
          const myAct = myGroup ? getActivity(myGroup,i) : null
          return (
            <div key={i} style={{ display:'flex',gap:10,alignItems:'stretch' }}>
              <div style={{ display:'flex',flexDirection:'column',alignItems:'center',width:64,paddingTop:11,flexShrink:0 }}>
                <p style={{ margin:0,fontSize:11,fontWeight:600,color:isCur?C.accent:C.muted,whiteSpace:'nowrap' }}>{fmtTime(slot.start)}</p>
                {i<SLOTS.length-1 && <div style={{ flex:1,width:1,background:isCur?C.accent:C.border,marginTop:5,marginBottom:4 }} />}
              </div>
              <div style={{ flex:1,marginBottom:6 }}>
                <div style={{ background:isCur?C.accentBg:C.surface,borderRadius:12,padding:'11px 14px',border:`1px solid ${isCur?C.accentBdr:C.border}`,opacity:isPast?0.42:1 }}>
                  <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:myAct&&!slot.allGroups?8:0 }}>
                    <p style={{ margin:0,fontSize:14,fontWeight:isCur?700:500,color:isCur?C.accent:C.text }}>
                      {slot.emoji} {slot.allGroups?slot.label:'Station Rotation'}
                    </p>
                    {isCur && <span style={{ fontSize:9,fontWeight:700,background:C.accent,color:'#fff',padding:'2px 8px',borderRadius:99,textTransform:'uppercase',letterSpacing:'.06em',flexShrink:0 }}>NOW</span>}
                  </div>
                  {slot.allGroups && <p style={{ margin:'3px 0 0',fontSize:11,color:C.muted }}>📍 {slot.location} · All Groups</p>}
                  {myAct && !slot.allGroups && myGroup && (
                    <div style={{ background:GROUPS[myGroup].bg,borderRadius:8,padding:'8px 10px',border:`1px solid ${GROUPS[myGroup].color}30` }}>
                      <p style={{ margin:'0 0 2px',fontSize:11,fontWeight:700,color:GROUPS[myGroup].color,textTransform:'uppercase',letterSpacing:'.06em' }}>{GROUPS[myGroup].label} Group</p>
                      <p style={{ margin:'0 0 2px',fontSize:14,fontWeight:700,color:C.text }}>{myAct.s}</p>
                      <p style={{ margin:0,fontSize:11,color:C.muted }}>📍 {myAct.l}</p>
                    </div>
                  )}
                  <p style={{ margin:'6px 0 0',fontSize:10,color:C.muted,opacity:0.6 }}>{fmtTime(slot.start)} – {fmtTime(slot.end)} · {toMin(slot.end)-toMin(slot.start)} min</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── COFFEE PAGE ──────────────────────────────────────────────────────────────
function CoffeePage() {
  const C = useC()
  const [name,setName] = useState('')
  const [cat,setCat] = useState('hot')
  const [sel,setSel] = useState([])
  const [size,setSize] = useState('')
  const [exSel,setExSel] = useState([])
  const [notes,setNotes] = useState('')
  const [sent,setSent] = useState(false)
  const [showExtras,setShowExtras] = useState(false)
  const toggleDrink = item => setSel(p=>p.includes(item)?p.filter(x=>x!==item):[...p,item])
  const toggleEx   = item => setExSel(p=>p.includes(item)?p.filter(x=>x!==item):[...p,item])
  const isCold = cat==='cold'
  const can = name.trim()&&sel.length>0&&(isCold||size)
  const send = () => {
    if (!can) return
    const sizeStr = isCold ? '16 oz' : size
    const extStr  = exSel.length ? ` + ${exSel.join(', ')}` : ''
    const noteStr = notes.trim() ? ` — ${notes.trim()}` : ''
    const msg = `VBS Order from ${name.trim()}: ${sel.join(', ')} (${sizeStr})${extStr}${noteStr}`
    window.location.href = `sms:${COFFEE_NUM}&body=${encodeURIComponent(msg)}`
    setSent(true); setTimeout(()=>setSent(false),4000)
  }
  return (
    <div>
      <div style={{ padding:'calc(14px + env(safe-area-inset-top,0px)) 16px 12px',borderBottom:`1px solid ${C.border}`,background:C.surface,position:'sticky',top:0,zIndex:10 }}>
        <h2 style={{ margin:'0 0 2px',fontSize:22,fontWeight:700,color:C.text }}>Coffee</h2>
        <p style={{ margin:0,fontSize:12,color:C.muted }}>The Café @ Gateway · Pearson Fellowship Hall</p>
      </div>
      <div style={{ padding:'14px 16px calc(92px + env(safe-area-inset-bottom,0px))' }}>
        {sent && <div style={{ background:C.greenBg,border:`1px solid ${C.accentBdr}`,borderRadius:12,padding:'12px 16px',marginBottom:12,animation:'fadeUp 0.3s ease both',display:'flex',alignItems:'center',gap:10 }}><span style={{ fontSize:18 }}>✅</span><p style={{ margin:0,fontSize:14,color:C.green,fontWeight:600 }}>Order sent! Open your texts and tap send.</p></div>}

        <SecLabel>1 · Your Name</SecLabel>
        <SCard style={{ padding:'12px 14px' }}>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your name..." style={{ width:'100%',background:'transparent',border:'none',outline:'none',fontSize:16,color:C.text,fontFamily:'inherit',padding:0 }} />
        </SCard>

        <SecLabel>2 · Hot or Cold?</SecLabel>
        <div style={{ display:'flex',gap:8,marginBottom:isCold?4:0 }}>
          {Object.entries(MENU).map(([key,m]) => (
            <Tap key={key} onClick={()=>{setCat(key);setSel([]);setSize('')}} style={{ flex:1,padding:'12px',borderRadius:12,border:`1.5px solid ${cat===key?C.accent:C.border}`,background:cat===key?C.accentBg:C.surface,textAlign:'center' }}>
              <span style={{ fontSize:20,display:'block',marginBottom:3 }}>{m.emoji}</span>
              <span style={{ fontSize:13,fontWeight:700,color:cat===key?C.accent:C.muted }}>{m.label}</span>
            </Tap>
          ))}
        </div>
        {isCold && <p style={{ margin:'6px 0 0',fontSize:11,color:C.muted }}>All cold drinks are 16 oz</p>}

        <SecLabel>3 · Choose Your Drink{sel.length>0?` (${sel.length} selected)`:''}</SecLabel>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14 }}>
          {MENU[cat].items.map(item => {
            const on = sel.includes(item)
            return <Tap key={item} onClick={()=>toggleDrink(item)} style={{ background:on?C.accentBg:C.surface,border:`1.5px solid ${on?C.accent:C.border}`,borderRadius:10,padding:'11px 12px' }}><p style={{ margin:0,fontSize:13,fontWeight:on?700:500,color:on?C.accent:C.text }}>{item}</p></Tap>
          })}
        </div>

        {!isCold && (
          <>
            <SecLabel>4 · Size</SecLabel>
            <div style={{ display:'flex',gap:8,marginBottom:14 }}>
              {SIZES.map(s => <Tap key={s} onClick={()=>setSize(s)} style={{ flex:1,padding:'10px',borderRadius:10,border:`1.5px solid ${size===s?C.accent:C.border}`,background:size===s?C.accentBg:C.surface,textAlign:'center' }}><span style={{ fontSize:14,fontWeight:700,color:size===s?C.accent:C.muted }}>{s}</span></Tap>)}
            </div>
          </>
        )}

        {/* Extras — collapsed */}
        <Tap onClick={()=>setShowExtras(p=>!p)} style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:'12px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:showExtras?8:14 }}>
          <span style={{ fontSize:14,fontWeight:500,color:C.text }}>
            Extras{exSel.length>0?` · ${exSel.length} selected`:''}<span style={{ color:C.muted,fontSize:13 }}> (optional)</span>
          </span>
          <ChevronDown size={16} color={C.muted} style={{ transform:showExtras?'rotate(180deg)':'rotate(0)',transition:'transform 0.2s ease',flexShrink:0 }} />
        </Tap>
        {showExtras && (
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14 }}>
            {EXTRAS.map(item => {
              const on = exSel.includes(item)
              return <Tap key={item} onClick={()=>toggleEx(item)} style={{ background:on?C.accentBg:C.surface,border:`1.5px solid ${on?C.accent:C.border}`,borderRadius:10,padding:'10px 12px' }}><p style={{ margin:0,fontSize:12,fontWeight:on?700:500,color:on?C.accent:C.muted }}>{item}</p></Tap>
            })}
          </div>
        )}

        <SecLabel>Notes (optional)</SecLabel>
        <SCard style={{ padding:'12px 14px',marginBottom:18 }}>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Any other requests..." style={{ width:'100%',background:'transparent',border:'none',outline:'none',fontSize:14,color:C.text,fontFamily:'inherit',resize:'none',minHeight:48,padding:0 }} />
        </SCard>

        <Tap onClick={send} disabled={!can} style={{ padding:'15px',borderRadius:14,textAlign:'center',background:can?C.accent:C.surfaceHi,border:can?'none':`1px solid ${C.border}` }}>
          <span style={{ fontSize:15,fontWeight:700,color:can?'#fff':C.muted }}>
            {can?'☕  Send Order via Text':'Fill in name & drink first'}
          </span>
        </Tap>
        <p style={{ textAlign:'center',fontSize:11,color:C.muted,marginTop:8 }}>Opens your texting app — just hit send</p>
      </div>
    </div>
  )
}

// ─── CREW PAGE ────────────────────────────────────────────────────────────────
function CrewPage({ live }) {
  const C = useC()
  const [ji,setJi] = useState(0)
  const [fi,setFi] = useState(0)
  const [ti,setTi] = useState(0)
  const [rev,setRev] = useState(false)
  const joke = JOKES[ji]
  const dayData = live.dayIdx>=0 ? DAYS[live.dayIdx] : DAYS[0]
  const nextJoke = () => { setJi(i=>(i+1)%JOKES.length); setRev(false) }
  return (
    <div>
      <div style={{ padding:'calc(14px + env(safe-area-inset-top,0px)) 16px 12px',borderBottom:`1px solid ${C.border}`,background:C.surface,position:'sticky',top:0,zIndex:10 }}>
        <h2 style={{ margin:'0 0 2px',fontSize:22,fontWeight:700,color:C.text }}>Crew</h2>
        <p style={{ margin:0,fontSize:12,color:C.muted }}>Resources for crew leaders</p>
      </div>
      <div style={{ padding:'14px 16px calc(92px + env(safe-area-inset-bottom,0px))' }}>

        <SecLabel>Today's Icebreaker · Day {dayData.n}</SecLabel>
        <SCard style={{ background:C.accentBg,border:`1px solid ${C.accentBdr}` }}>
          <p style={{ margin:'0 0 4px',fontSize:11,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',color:C.accent }}>Use this to open crew time</p>
          <p style={{ margin:0,fontSize:15,color:C.text,lineHeight:1.5,fontStyle:'italic' }}>"{dayData.icebreaker}"</p>
        </SCard>

        <SecLabel>Crew Joke</SecLabel>
        <SCard>
          <p style={{ margin:'0 0 10px',fontSize:14,fontWeight:600,color:C.text,lineHeight:1.5 }}>{joke.q}</p>
          {rev ? (
            <div style={{ background:C.accentBg,borderRadius:8,padding:'10px 12px',marginBottom:10,border:`1px solid ${C.accentBdr}` }}>
              <p style={{ margin:0,fontSize:14,fontWeight:700,color:C.accent }}>{joke.a}</p>
            </div>
          ) : (
            <Tap onClick={()=>setRev(true)} style={{ background:C.accentBg,border:`1px solid ${C.accentBdr}`,borderRadius:8,padding:'10px 12px',textAlign:'center',marginBottom:10 }}>
              <span style={{ fontSize:13,fontWeight:700,color:C.accent }}>Reveal Punchline</span>
            </Tap>
          )}
          <Tap onClick={nextJoke} style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'8px',borderRadius:8,border:`1px solid ${C.border}` }}>
            <RefreshCw size={13} color={C.muted} strokeWidth={2} />
            <span style={{ fontSize:12,color:C.muted,fontWeight:600 }}>Next Joke ({ji+1}/{JOKES.length})</span>
          </Tap>
        </SCard>

        <SecLabel>Rainforest Fact</SecLabel>
        <SCard>
          <p style={{ margin:'0 0 10px',fontSize:14,color:C.text,lineHeight:1.6 }}>🌿 {FACTS[fi]}</p>
          <Tap onClick={()=>setFi(i=>(i+1)%FACTS.length)} style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'8px',borderRadius:8,border:`1px solid ${C.border}` }}>
            <RefreshCw size={13} color={C.muted} strokeWidth={2} />
            <span style={{ fontSize:12,color:C.muted,fontWeight:600 }}>Next Fact ({fi+1}/{FACTS.length})</span>
          </Tap>
        </SCard>

        <SecLabel>Leader Tip</SecLabel>
        <SCard>
          <p style={{ margin:'0 0 12px',fontSize:14,color:C.text,lineHeight:1.55 }}>
            <span style={{ marginRight:6 }}>{TIPS[ti].icon}</span>{TIPS[ti].tip}
          </p>
          <div style={{ display:'flex',alignItems:'center',gap:8 }}>
            <Tap onClick={()=>setTi(i=>(i-1+TIPS.length)%TIPS.length)} style={{ background:C.surfaceHi,border:`1px solid ${C.border}`,borderRadius:8,padding:'7px 14px' }}>
              <span style={{ fontSize:13,color:C.muted,fontWeight:600 }}>‹ Prev</span>
            </Tap>
            <span style={{ flex:1,textAlign:'center',fontSize:12,color:C.muted }}>Tip {ti+1} of {TIPS.length}</span>
            <Tap onClick={()=>setTi(i=>(i+1)%TIPS.length)} style={{ background:C.surfaceHi,border:`1px solid ${C.border}`,borderRadius:8,padding:'7px 14px' }}>
              <span style={{ fontSize:13,color:C.muted,fontWeight:600 }}>Next ›</span>
            </Tap>
          </div>
        </SCard>

      </div>
    </div>
  )
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
const TABS = [
  { id:'today',    label:'Today',    Icon:Home     },
  { id:'schedule', label:'Schedule', Icon:Calendar },
  { id:'coffee',   label:'Coffee',   Icon:Coffee   },
  { id:'crew',     label:'Crew',     Icon:Users    },
]

function BottomNav({ page, setPage }) {
  const C = useC()
  return (
    <div style={{ position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:430,background:C.navBg,borderTop:`1px solid ${C.border}`,paddingBottom:'env(safe-area-inset-bottom,0px)',display:'flex',zIndex:50,boxShadow:'0 -1px 12px rgba(0,0,0,0.06)' }}>
      {TABS.map(({id,label,Icon}) => {
        const on = page===id
        return (
          <button key={id} onClick={()=>setPage(id)} style={{ flex:1,background:'none',border:'none',cursor:'pointer',padding:'10px 0 8px',display:'flex',flexDirection:'column',alignItems:'center',gap:2 }}>
            <div style={{ height:3,width:20,borderRadius:99,background:on?TH.accent:'transparent',marginBottom:4,transition:'background 0.2s' }} />
            <Icon size={22} strokeWidth={1.75} color={on?TH.accent:TH.muted} style={{ transition:'color 0.2s' }} />
            <span style={{ fontSize:10,fontWeight:on?700:500,color:on?TH.accent:TH.muted,letterSpacing:'0.04em',transition:'color 0.2s' }}>{label}</span>
          </button>
        )
      })}
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function VBSLeaderHub() {
  const [splash,setSplash] = useState(true)
  const [myGroup,setMyGroup] = useState(() => { try { return localStorage.getItem('rfGroup') || null } catch { return null } })
  const [page,setPage] = useState('today')
  const [now,setNow] = useState(new Date())
  const [changing,setChanging] = useState(false)

  useEffect(() => {
    const s = document.createElement('style'); s.textContent = GCSS; document.head.appendChild(s)
    const l = document.createElement('link'); l.rel='stylesheet'; l.href='https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'; document.head.appendChild(l)
    return () => { try{document.head.removeChild(s)}catch{} try{document.head.removeChild(l)}catch{} }
  },[])

  useEffect(() => { const t=setInterval(()=>setNow(new Date()),60000); return()=>clearInterval(t) },[])

  const live = getLive(now)
  const g = myGroup ? GROUPS[myGroup] : null

  if (splash) return <TC.Provider value={TH}><Splash onDone={()=>setSplash(false)} /></TC.Provider>
  const saveGroup = g => { try { localStorage.setItem('rfGroup', g) } catch {} setMyGroup(g) }
  if (!myGroup) return <TC.Provider value={TH}><GroupPicker onSelect={saveGroup} /></TC.Provider>

  return (
    <TC.Provider value={TH}>
      <div style={{ background:TH.bg,minHeight:'100vh',color:TH.text,fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",maxWidth:430,margin:'0 auto',position:'relative' }}>
        <div style={{ padding:'calc(12px + env(safe-area-inset-top,0px)) 16px 12px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:`1px solid ${TH.border}`,background:TH.surface,position:'sticky',top:0,zIndex:20 }}>
          <div>
            <p style={{ margin:0,fontSize:10,fontWeight:600,letterSpacing:'0.12em',textTransform:'uppercase',color:TH.muted,lineHeight:1 }}>Gateway Church · VBS 2026</p>
            <h1 style={{ margin:0,fontSize:20,fontWeight:700,color:TH.text,lineHeight:1.2 }}>Rainforest Falls</h1>
          </div>
          {g && (
            <Tap onClick={()=>setChanging(true)} style={{ background:g.bg,border:`1px solid ${g.color}50`,borderRadius:20,padding:'5px 12px',display:'flex',alignItems:'center',gap:6 }}>
              <div style={{ width:8,height:8,borderRadius:'50%',background:g.color }} />
              <span style={{ fontSize:11,fontWeight:700,color:g.color }}>{g.label.split(' ')[0]}</span>
            </Tap>
          )}
        </div>
        <div key={page} style={{ animation:'tabFade 220ms cubic-bezier(0.2,0,0,1) both' }}>
          {page==='today'    && <TodayPage myGroup={myGroup} live={live} now={now} onViewSchedule={()=>setPage('schedule')} />}
          {page==='schedule' && <SchedulePage myGroup={myGroup} live={live} now={now} />}
          {page==='coffee'   && <CoffeePage />}
          {page==='crew'     && <CrewPage live={live} />}
        </div>
        <BottomNav page={page} setPage={setPage} />
        {changing && <GroupModal myGroup={myGroup} onSelect={g=>{saveGroup(g);setChanging(false)}} onClose={()=>setChanging(false)} />}
      </div>
    </TC.Provider>
  )
}
