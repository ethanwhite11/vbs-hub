import { useState, useEffect, createContext, useContext } from "react"
import { Calendar, Coffee, Users, Home, ChevronDown, ChevronRight, ChevronLeft, RefreshCw } from "lucide-react"

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const GCSS = `
  @keyframes splashIn   { 0%{opacity:0;transform:scale(0.5)} 60%{opacity:1;transform:scale(1.08)} 80%{transform:scale(0.96)} 100%{transform:scale(1)} }
  @keyframes splashText { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes tabFade    { from{opacity:0;transform:scale(0.99) translateY(4px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes fadeUp     { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes livePulse  { 0%,100%{opacity:1} 50%{opacity:0.35} }
  * { -webkit-tap-highlight-color:transparent; box-sizing:border-box; }
  body { overscroll-behavior:none; margin:0; background:#f5f5f5; font-family:'Plus Jakarta Sans',system-ui,sans-serif; }
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
  red:    { color:'#E05252', bg:'rgba(224,82,82,0.10)',   dark:'rgba(224,82,82,0.18)',   label:'Red',                short:'Red', delivery:'Red Group'    },
  yellow: { color:'#D4A017', bg:'rgba(212,160,23,0.10)',  dark:'rgba(212,160,23,0.18)',  label:'Yellow',             short:'Yel', delivery:'Yellow Group' },
  green:  { color:'#38A85A', bg:'rgba(56,168,90,0.10)',   dark:'rgba(56,168,90,0.18)',   label:'Green',              short:'Grn', delivery:'Green Group'  },
  blue:   { color:'#3B82F6', bg:'rgba(59,130,246,0.10)',  dark:'rgba(59,130,246,0.18)',  label:'Blue',               short:'Blu', delivery:'Blue Group'   },
  purple: { color:'#9B5CF6', bg:'rgba(155,92,246,0.10)',  dark:'rgba(155,92,246,0.18)',  label:'Purple',             short:'Pur', delivery:'Purple Group' },
  orange: { color:'#F97316', bg:'rgba(249,115,22,0.10)',  dark:'rgba(249,115,22,0.18)',  label:'Orange · Preschool', short:'Pre', delivery:'Orange Group' },
  none:   { color:'#888888', bg:'rgba(136,136,136,0.10)', dark:'rgba(136,136,136,0.18)', label:'No Group',           short:'',    delivery:''             },
}

// ─── BUDDY IMAGES ─────────────────────────────────────────────────────────────
const BUDDY_IMGS = {
  1: '/Day1-Tango.png',
  2: '/Day2-Seymour.png',
  3: '/Day3-Dottie.png',
  4: '/Day4-Tia.png',
  5: '/Day5-Howie.png',
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
  { n:1,date:'2026-07-13',label:'Mon · July 13',point:'God is our creator.',passage:'Genesis 1',verseRef:'Psalm 103:22',verseText:'"Let everything he has created praise the Lord, for he has given the order."',buddy:'Tango',accentColor:'#F0B429',icebreaker:"What's the coolest thing God made that you've ever seen in nature?",reminders:['Introduce yourself to every kid in your group today','Help your crew come up with a name or cheer','Watch for God Sightings — share one of yours first to model it','Response to Bible Point: "Wow, God!" — model it before they echo it','Encourage every kid to write their first God Sighting'] },
  { n:2,date:'2026-07-14',label:'Tue · July 14',point:'God knows everything.',passage:'Psalm 139',verseRef:'Psalm 139:1',verseText:'"O Lord, you have examined my heart and know everything about me."',buddy:'Seymour',accentColor:'#9B5CF6',icebreaker:"What's something surprising about yourself that most people don't know?",reminders:["You should know every kid's name by now — use them constantly","Connect today's point to God Sightings from yesterday",'Affirm kids who were brave enough to share yesterday','Check in: is anyone having a hard time so far?','Keep crew transitions tight — things should be running smoother'] },
  { n:3,date:'2026-07-15',label:'Wed · July 15',point:'God is our safe place.',passage:'1 Samuel 23–24',verseRef:'Psalm 142:5',verseText:'"Then I pray to you, O Lord. I say, \'You are my place of refuge.\'"',buddy:'Dottie',accentColor:'#3B82F6',icebreaker:"Where's your favorite place to go when you need to feel safe or calm?",reminders:["Hump day — energy may dip. Keep transitions fun and snappy","The 'safe place' theme lands deep for some kids — stay emotionally present",'Pull aside a quieter kid and check in one-on-one','Remind your crew they can always come to you if something feels wrong','Celebrate God Sightings loudly — the habit is forming'] },
  { n:4,date:'2026-07-16',label:'Thu · July 16',point:'God is love.',passage:'Luke 22:39–24:12',verseRef:'Psalm 136:1',verseText:'"Give thanks to the Lord, for he is good! His faithful love endures forever."',buddy:'Tia',accentColor:'#E05252',icebreaker:"What's the nicest thing someone has done for you?",reminders:["One more day after this — make every moment count","Go out of your way for any kid who's been on the fringe all week",'Operation Kid-to-Kid giving — encourage generosity, never pressure','Write a personal encouragement note to each kid in your group','Finish strong — the last impression matters as much as the first'] },
  { n:5,date:'2026-07-17',label:'Fri · July 17',point:'God is forever.',passage:'Revelation 7:17; 21–22',verseRef:'Psalm 115:18',verseText:'"But we will bless the Lord both now and forever. Praise the Lord!"',buddy:'Howie',accentColor:'#4ACC80',icebreaker:"If you could do one thing forever, what would it be?",reminders:['Last day — make it unforgettable for every kid in your group','Families join Canopy Closing today — help your crew shine','Personally affirm each kid before they leave','Collect any remaining God Sightings for the display board','Thank your team and celebrate what God did this week'] },
]

// ─── COFFEE ───────────────────────────────────────────────────────────────────
const MENU = {
  hot:  { label:'Hot',  emoji:'☕', items:['Americano','Latte / Cappuccino','Almond Milk Latte','Breve Latte','Mocha','Caramel Macchiato','Chai Tea Latte','London Fog','Hot Chocolate'] },
  iced: { label:'Iced', emoji:'❄️', items:['Americano','Latte / Cappuccino','Almond Milk Latte','Breve Latte','Mocha','Caramel Macchiato','Chai Tea Latte'] },
  cold: { label:'Cold', emoji:'🧊', items:['Italian Soda','Joe Chill','Chai Chill','Fruit Smoothie'] },
}
const SYRUPS = [
  { name:'Caramel',         sf:true  },
  { name:'Hazelnut',        sf:false },
  { name:'Irish Cream',     sf:false },
  { name:'Lavender',        sf:false },
  { name:'Peppermint',      sf:false },
  { name:'Vanilla',         sf:true  },
  { name:'Apple',           sf:false },
  { name:'Blueberry',       sf:false },
  { name:'Cherry',          sf:false },
  { name:'Lime',            sf:false },
  { name:'Mango',           sf:false },
  { name:'Orange',          sf:false },
  { name:'Peach',           sf:false },
  { name:'Pineapple',       sf:false },
  { name:'Raspberry',       sf:true  },
  { name:'Strawberry',      sf:false },
  { name:'Watermelon',      sf:false },
  { name:'Dubai Chocolate', sf:true  },
]
const MILKS = ['Almond Milk','Oat Milk']
const MILK_ELIGIBLE = new Set(['Americano','Latte / Cappuccino','Breve Latte','Mocha','Chai Tea Latte','London Fog','Hot Chocolate'])
const SYRUP_REQUIRED = new Set(['Italian Soda'])
const EXTRAS = ['Extra Shot of Espresso','Bottled Water','Hot Tea','Biscotti','Trail Mix','Mentos']
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

const ICEBREAKERS = [
  "If you could have any superpower, what would it be and why?",
  "What's the funniest thing that has ever happened to you?",
  "If you could only eat one food for the rest of your life, what would it be?",
  "Would you rather be able to fly or be invisible? Why?",
  "What's your favorite thing to do on a Saturday morning?",
  "If you could have any animal as a pet, what would you choose?",
  "What's the best gift you've ever received?",
  "If you could visit any place in the world, where would you go?",
  "What's a talent or skill you have that might surprise people?",
  "Would you rather live in the ocean or on the moon?",
  "What's your go-to karaoke song (even if you'd never actually sing it)?",
  "If you could swap lives with any cartoon character for a day, who would it be?",
  "What's the weirdest food combination you actually love?",
  "If you started a YouTube channel, what would it be about?",
  "What's one thing on your bucket list?",
  "Would you rather always be too hot or always be too cold?",
  "What's the best movie you've seen in the last year?",
  "If you could invent something that doesn't exist yet, what would it be?",
  "What's something you're really proud of that you've made or built?",
  "If you could be any age for a whole year, what age would you pick?",
  "What's the bravest thing you've ever done?",
  "Would you rather be the funniest person in the room or the smartest?",
  "What's a show or game you could play or watch for hours without getting bored?",
  "If your life was a movie, what genre would it be?",
  "If you could add one rule to your school or family, what would it be?",
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
        {Object.entries(GROUPS).filter(([k]) => k !== 'none').map(([key,g]) => (
          <Tap key={key} onClick={()=>setSel(key)} style={{ background:sel===key?g.dark:C.surface,border:`2px solid ${sel===key?g.color:C.border}`,borderRadius:18,padding:'22px 14px',textAlign:'center' }}>
            <div style={{ width:44,height:44,borderRadius:'50%',background:g.color,margin:'0 auto 12px',boxShadow:sel===key?`0 0 18px ${g.color}50`:'none' }} />
            <p style={{ margin:0,fontSize:14,fontWeight:700,color:sel===key?g.color:C.text,lineHeight:1.3 }}>{g.label}</p>
          </Tap>
        ))}
      </div>
      <Tap onClick={()=>setSel('none')} style={{ marginTop:10,padding:'14px',borderRadius:14,textAlign:'center',background:sel==='none'?GROUPS.none.dark:C.surface,border:`2px solid ${sel==='none'?GROUPS.none.color:C.border}` }}>
        <span style={{ fontSize:14,fontWeight:600,color:sel==='none'?GROUPS.none.color:C.muted }}>I'm not in a color group (station leader, stage, staff)</span>
      </Tap>
      <Tap onClick={()=>sel&&onSelect(sel)} disabled={!sel} style={{ marginTop:10,padding:'15px',borderRadius:14,textAlign:'center',background:sel?GROUPS[sel].color:C.surfaceHi }}>
        <span style={{ fontSize:15,fontWeight:700,color:sel?'#fff':C.muted }}>
          {sel==='none'?'Continue as staff / no group':sel?`I'm on the ${GROUPS[sel].label} group`:'Select a group above'}
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

// ─── NOW HERO — full-bleed T1, handles safe-area, owns the group badge ────────
function NowHero({ myGroup, live, onChangeGroup }) {
  const C = useC()
  const g = myGroup ? GROUPS[myGroup] : null
  const safePad = 'calc(22px + env(safe-area-inset-top,0px))'
  const greenBase = { background:C.accent, padding:`${safePad} 20px 26px`, borderRadius:'0 0 24px 24px' }
  const lightBase = { background:C.surface, padding:`${safePad} 20px 22px`, borderBottom:`1px solid ${C.border}` }

  const hasColorGroup = myGroup && myGroup !== 'none'
  const WhiteBadge = () => (
    <Tap onClick={onChangeGroup} style={{ background:'rgba(255,255,255,0.2)',borderRadius:20,padding:'5px 12px',display:'flex',alignItems:'center',gap:5,flexShrink:0 }}>
      {hasColorGroup && <div style={{ width:7,height:7,borderRadius:'50%',background:'rgba(255,255,255,0.9)' }} />}
      <span style={{ fontSize:11,fontWeight:700,color:'#fff' }}>{hasColorGroup ? g.label.split(' ')[0] : 'Staff'}</span>
    </Tap>
  )

  const ColorBadge = () => (
    <Tap onClick={onChangeGroup} style={{ background:hasColorGroup?g.bg:'rgba(0,0,0,0.05)',border:`1px solid ${hasColorGroup?g.color+'50':C.border}`,borderRadius:20,padding:'5px 12px',display:'flex',alignItems:'center',gap:5,flexShrink:0 }}>
      {hasColorGroup && <div style={{ width:7,height:7,borderRadius:'50%',background:g.color }} />}
      <span style={{ fontSize:11,fontWeight:700,color:hasColorGroup?g.color:C.muted }}>{hasColorGroup ? g.label.split(' ')[0] : 'Staff'}</span>
    </Tap>
  )

  if (live.status === 'countdown') return (
    <div style={greenBase}>
      <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20 }}>
        <div>
          <p style={{ margin:0,fontSize:10,fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',color:'rgba(255,255,255,0.65)' }}>Gateway Church · VBS 2026</p>
          <p style={{ margin:'3px 0 0',fontSize:17,fontWeight:700,color:'rgba(255,255,255,0.95)' }}>Rainforest Falls</p>
        </div>
        <WhiteBadge />
      </div>
      <p style={{ margin:0,fontSize:38,fontWeight:800,color:'#fff',lineHeight:1.1 }}>July 13–17 🌿</p>
      <p style={{ margin:'8px 0 0',fontSize:15,color:'rgba(255,255,255,0.78)' }}>Coming soon · 9:00 AM – 12:00 PM</p>
    </div>
  )

  if (live.status === 'done') return (
    <div style={lightBase}>
      <p style={{ margin:'0 0 6px',fontSize:11,fontWeight:600,color:C.muted,textTransform:'uppercase',letterSpacing:'.06em' }}>Rainforest Falls · VBS 2026</p>
      <p style={{ margin:0,fontSize:26,fontWeight:700,color:C.muted }}>VBS 2026 complete. See you next year 🌿</p>
    </div>
  )

  if (live.status === 'before') return (
    <div style={greenBase}>
      <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20 }}>
        <p style={{ margin:0,fontSize:11,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'rgba(255,255,255,0.7)' }}>
          {live.dayIdx >= 0 ? DAYS[live.dayIdx].label : ''} · VBS 2026
        </p>
        <WhiteBadge />
      </div>
      <p style={{ margin:'0 0 4px',fontSize:15,color:'rgba(255,255,255,0.75)' }}>Program starts in</p>
      <p style={{ margin:0,fontSize:52,fontWeight:800,color:'#fff',lineHeight:1 }}>
        {live.minUntil}<span style={{ fontSize:22,fontWeight:600 }}> min</span>
      </p>
    </div>
  )

  if (live.status === 'after') return (
    <div style={lightBase}>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10 }}>
        <p style={{ margin:0,fontSize:11,fontWeight:600,color:C.muted,textTransform:'uppercase',letterSpacing:'.06em' }}>
          {live.dayIdx >= 0 ? DAYS[live.dayIdx].label : ''}
        </p>
        <ColorBadge />
      </div>
      <p style={{ margin:0,fontSize:28,fontWeight:700,color:C.muted }}>Wrapped for today</p>
    </div>
  )

  // Live state
  const { slot, slotIdx, minLeft, progress, next } = live
  const myAct = myGroup ? getActivity(myGroup, slotIdx) : null
  const nextIdx = next ? SLOTS.indexOf(next) : -1
  const nextAct = myGroup && nextIdx >= 0 ? getActivity(myGroup, nextIdx) : null
  const nextLabel = next ? (next.allGroups ? next.label : nextAct?.s || 'Station Rotation') : null

  return (
    <div style={greenBase}>
      <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:16 }}>
        <div style={{ display:'flex',alignItems:'center',gap:6 }}>
          <div style={{ width:6,height:6,borderRadius:'50%',background:'rgba(255,255,255,0.85)',animation:'livePulse 2s ease infinite' }} />
          <span style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.8)',letterSpacing:'.08em',textTransform:'uppercase' }}>
            Live Now · {DAYS[live.dayIdx].label}
          </span>
        </div>
        <WhiteBadge />
      </div>
      {myAct ? (
        <>
          <p style={{ margin:'0 0 4px',fontSize:34,fontWeight:800,color:'#fff',lineHeight:1.1 }}>{myAct.s}</p>
          <p style={{ margin:'0 0 18px',fontSize:13,color:'rgba(255,255,255,0.82)' }}>📍 {myAct.l}</p>
          <div style={{ height:3,background:'rgba(255,255,255,0.25)',borderRadius:99,overflow:'hidden',marginBottom:8 }}>
            <div style={{ height:'100%',width:`${Math.min(100,Math.max(0,progress*100))}%`,background:'#fff',borderRadius:99,transition:'width 30s linear' }} />
          </div>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
            <span style={{ fontSize:13,color:'rgba(255,255,255,0.9)',fontWeight:700 }}>{minLeft} min left</span>
            {next && <span style={{ fontSize:11,color:'rgba(255,255,255,0.65)' }}>Next: {nextLabel} · {fmtTime(next.start)}</span>}
          </div>
        </>
      ) : (
        <>
          <p style={{ margin:'0 0 4px',fontSize:28,fontWeight:700,color:'#fff' }}>
            {slot.allGroups ? slot.label : 'Station Rotation'}
          </p>
          {slot.allGroups && <p style={{ margin:0,fontSize:13,color:'rgba(255,255,255,0.8)' }}>📍 {slot.location} · All Groups</p>}
        </>
      )}
    </div>
  )
}

// ─── TEACHING CARD — merges Bible Point, Memory Verse, Icebreaker ─────────────
function TeachingCard({ day }) {
  const C = useC()
  return (
    <div style={{ background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,overflow:'hidden',marginBottom:10 }}>
      <div style={{ background:`${day.accentColor}14`,borderBottom:`1px solid ${C.border}`,padding:'14px 16px',display:'flex',alignItems:'center',gap:14 }}>
        <img src={BUDDY_IMGS[day.n]} alt={day.buddy} style={{ width:72,height:72,objectFit:'contain',flexShrink:0 }} />
        <div>
          <p style={{ margin:'0 0 2px',fontSize:11,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',color:C.muted }}>Day {day.n} Buddy</p>
          <p style={{ margin:0,fontSize:20,fontWeight:700,color:C.text,lineHeight:1.2 }}>{day.buddy}</p>
        </div>
      </div>
      <div style={{ padding:'16px 16px 14px',borderBottom:`1px solid ${C.border}` }}>
        <p style={{ margin:'0 0 8px',fontSize:11,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',color:C.muted }}>Day {day.n} · Bible Point</p>
        <p style={{ margin:'0 0 10px',fontSize:22,fontWeight:700,color:C.text,lineHeight:1.2 }}>{day.point}</p>
        <span style={{ display:'inline-flex',background:C.accentBg,border:`1px solid ${C.accentBdr}`,borderRadius:8,padding:'3px 10px',marginBottom:12 }}>
          <span style={{ fontSize:12,fontWeight:700,color:C.accent }}>"Wow, God!"</span>
        </span>
        <p style={{ margin:'0 0 6px',fontSize:14,color:C.text,lineHeight:1.6,fontStyle:'italic' }}>{day.verseText}</p>
        <p style={{ margin:0,fontSize:11,fontWeight:700,color:C.accent,textTransform:'uppercase',letterSpacing:'.06em' }}>{day.verseRef}</p>
      </div>
      <div style={{ padding:'12px 16px' }}>
        <p style={{ margin:'0 0 5px',fontSize:11,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',color:C.muted }}>Crew Icebreaker</p>
        <p style={{ margin:0,fontSize:14,color:C.text,lineHeight:1.55,fontStyle:'italic' }}>"{day.icebreaker}"</p>
      </div>
    </div>
  )
}

// ─── CREW KIT — tabbed Joke / Fact / Tip in one card ─────────────────────────
function CrewKit() {
  const C = useC()
  const [tab,setTab] = useState('joke')
  const [ji,setJi] = useState(0)
  const [fi,setFi] = useState(0)
  const [ti,setTi] = useState(0)
  const [rev,setRev] = useState(false)
  const joke = JOKES[ji]
  const nextJoke = () => { setJi(i=>(i+1)%JOKES.length); setRev(false) }

  return (
    <div style={{ background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,overflow:'hidden' }}>
      <div style={{ display:'flex' }}>
        {['joke','ice','tip'].map(t => (
          <Tap key={t} onClick={()=>setTab(t)} style={{ flex:1,padding:'12px 0',textAlign:'center',borderBottom:`2px solid ${tab===t?C.accent:C.border}` }}>
            <span style={{ fontSize:13,fontWeight:tab===t?700:500,color:tab===t?C.accent:C.muted }}>
              {t === 'joke' ? 'Joke' : t === 'ice' ? 'Icebreaker' : 'Tip'}
            </span>
          </Tap>
        ))}
      </div>
      <div style={{ padding:'14px 16px' }}>
        {tab === 'joke' && (
          <>
            <p style={{ margin:'0 0 12px',fontSize:14,fontWeight:600,color:C.text,lineHeight:1.5 }}>{joke.q}</p>
            {rev
              ? <div style={{ background:C.accentBg,borderRadius:10,padding:'10px 12px',marginBottom:10,border:`1px solid ${C.accentBdr}` }}>
                  <p style={{ margin:0,fontSize:14,fontWeight:700,color:C.accent }}>{joke.a}</p>
                </div>
              : <Tap onClick={()=>setRev(true)} style={{ background:C.accentBg,border:`1px solid ${C.accentBdr}`,borderRadius:10,padding:'10px 12px',textAlign:'center',marginBottom:10 }}>
                  <span style={{ fontSize:13,fontWeight:700,color:C.accent }}>Reveal Punchline</span>
                </Tap>
            }
            <Tap onClick={nextJoke} style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'8px',borderRadius:8,border:`1px solid ${C.border}` }}>
              <RefreshCw size={13} color={C.muted} strokeWidth={2} />
              <span style={{ fontSize:12,color:C.muted,fontWeight:600 }}>Next Joke ({ji+1}/{JOKES.length})</span>
            </Tap>
          </>
        )}
        {tab === 'ice' && (
          <>
            <p style={{ margin:'0 0 12px',fontSize:14,color:C.text,lineHeight:1.6 }}>{ICEBREAKERS[fi]}</p>
            <Tap onClick={()=>setFi(i=>(i+1)%ICEBREAKERS.length)} style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'8px',borderRadius:8,border:`1px solid ${C.border}` }}>
              <RefreshCw size={13} color={C.muted} strokeWidth={2} />
              <span style={{ fontSize:12,color:C.muted,fontWeight:600 }}>Next Question ({fi+1}/{ICEBREAKERS.length})</span>
            </Tap>
          </>
        )}
        {tab === 'tip' && (
          <>
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
          </>
        )}
      </div>
    </div>
  )
}

// ─── TODAY PAGE ───────────────────────────────────────────────────────────────
function TodayPage({ myGroup, live, now, onViewSchedule, onChangeGroup }) {
  const C = useC()
  const dayIdx = live.dayIdx >= 0 ? live.dayIdx : (now < new Date('2026-07-13') ? 0 : DAYS.length - 1)
  const day = DAYS[dayIdx]
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
      <NowHero myGroup={myGroup} live={live} onChangeGroup={onChangeGroup} />

      <div style={{ padding:'14px 16px calc(92px + env(safe-area-inset-bottom,0px))' }}>

        <TeachingCard day={day} />

        <p style={{ margin:'16px 0 8px',fontSize:11,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',color:C.muted }}>
          Coming up
        </p>
        {upcomingSlots.map(slot => {
          const active = isCur(slot.i)
          const past = isPast(slot)
          const myAct = myGroup ? getActivity(myGroup, slot.i) : null
          const displayName = slot.allGroups ? slot.label : (myAct ? myAct.s : 'Station Rotation')
          const displayLoc  = slot.allGroups ? slot.location : myAct?.l
          return (
            <div key={slot.i} style={{ background:active?C.accentBg:C.surface,borderRadius:12,border:`1px solid ${active?C.accentBdr:C.border}`,padding:'11px 14px',marginBottom:6,opacity:past?0.4:1 }}>
              <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:2 }}>
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
        <Tap onClick={onViewSchedule} style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:4,padding:'10px',borderRadius:12,border:`1px solid ${C.border}`,background:C.surface,marginBottom:14 }}>
          <span style={{ fontSize:13,fontWeight:600,color:C.accent }}>Full schedule</span>
          <ChevronRight size={14} color={C.accent} />
        </Tap>

      </div>
    </div>
  )
}

// ─── SCHEDULE PAGE ────────────────────────────────────────────────────────────
function SchedulePage({ myGroup, live, now, onChangeGroup }) {
  const C = useC()
  const g = myGroup ? GROUPS[myGroup] : null
  const cur = now.getHours()*60+now.getMinutes()
  const inVbs = ['live','before','after'].includes(live.status)

  return (
    <div>
      <div style={{ padding:'calc(22px + env(safe-area-inset-top,0px)) 16px 14px' }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4 }}>
          <h2 style={{ margin:0,fontSize:28,fontWeight:700,color:C.text }}>Schedule</h2>
          {myGroup && (
            <Tap onClick={onChangeGroup} style={{ background:g&&myGroup!=='none'?g.bg:'rgba(0,0,0,0.05)',border:`1px solid ${g&&myGroup!=='none'?g.color+'50':C.border}`,borderRadius:20,padding:'5px 12px',display:'flex',alignItems:'center',gap:6 }}>
              {g && myGroup !== 'none' && <div style={{ width:8,height:8,borderRadius:'50%',background:g.color }} />}
              <span style={{ fontSize:11,fontWeight:700,color:g&&myGroup!=='none'?g.color:C.muted }}>{g&&myGroup!=='none'?g.label.split(' ')[0]:'Staff'}</span>
            </Tap>
          )}
        </div>
        <p style={{ margin:0,fontSize:12,color:C.muted }}>July 13–17 · 9:00 AM – 12:00 PM daily</p>
      </div>

      <div style={{ padding:'0 16px calc(92px + env(safe-area-inset-bottom,0px))' }}>
        {SLOTS.map((slot,i) => {
          const e = toMin(slot.end)
          const isCur = live.status==='live' && live.slotIdx===i
          const isPast = inVbs && cur>e
          const myAct = myGroup ? getActivity(myGroup,i) : null
          const displayName = slot.allGroups ? slot.label : (myAct ? myAct.s : 'Station Rotation')
          const displayLoc  = slot.allGroups ? slot.location : myAct?.l

          // Current slot — dominant full-color card
          if (isCur) return (
            <div key={i} style={{ background:C.accent,borderRadius:16,padding:'18px 20px',marginBottom:8 }}>
              <div style={{ display:'flex',alignItems:'center',gap:6,marginBottom:12 }}>
                <div style={{ width:6,height:6,borderRadius:'50%',background:'rgba(255,255,255,0.85)',animation:'livePulse 2s ease infinite' }} />
                <span style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.8)',letterSpacing:'.08em',textTransform:'uppercase' }}>
                  Now · {fmtTime(slot.start)} – {fmtTime(slot.end)}
                </span>
              </div>
              <p style={{ margin:'0 0 4px',fontSize:28,fontWeight:800,color:'#fff',lineHeight:1.1 }}>{displayName}</p>
              {displayLoc && <p style={{ margin:'0 0 16px',fontSize:13,color:'rgba(255,255,255,0.82)' }}>📍 {displayLoc}</p>}
              <div style={{ height:3,background:'rgba(255,255,255,0.25)',borderRadius:99,overflow:'hidden',marginBottom:8 }}>
                <div style={{ height:'100%',width:`${Math.min(100,Math.max(0,live.progress*100))}%`,background:'#fff',borderRadius:99,transition:'width 30s linear' }} />
              </div>
              <span style={{ fontSize:12,color:'rgba(255,255,255,0.85)',fontWeight:600 }}>{live.minLeft} min left</span>
            </div>
          )

          // Past slots — single compact faded row
          if (isPast) return (
            <div key={i} style={{ display:'flex',alignItems:'center',gap:10,padding:'7px 4px',opacity:0.3,marginBottom:2 }}>
              <p style={{ margin:0,fontSize:11,color:C.muted,whiteSpace:'nowrap',minWidth:58,flexShrink:0 }}>{fmtTime(slot.start)}</p>
              <div style={{ width:1,height:14,background:C.border,flexShrink:0 }} />
              <p style={{ margin:0,fontSize:13,color:C.text }}>{displayName}</p>
            </div>
          )

          // Future slots — compact timeline
          return (
            <div key={i} style={{ display:'flex',gap:10,alignItems:'stretch' }}>
              <div style={{ display:'flex',flexDirection:'column',alignItems:'center',width:64,paddingTop:11,flexShrink:0 }}>
                <p style={{ margin:0,fontSize:11,fontWeight:600,color:C.muted,whiteSpace:'nowrap' }}>{fmtTime(slot.start)}</p>
                {i<SLOTS.length-1 && <div style={{ flex:1,width:1,background:C.border,marginTop:5,marginBottom:4 }} />}
              </div>
              <div style={{ flex:1,marginBottom:6 }}>
                <div style={{ background:C.surface,borderRadius:12,padding:'10px 14px',border:`1px solid ${C.border}` }}>
                  <p style={{ margin:0,fontSize:14,fontWeight:500,color:C.text,marginBottom:myAct&&!slot.allGroups?8:0 }}>
                    {slot.emoji} {slot.allGroups?slot.label:'Station Rotation'}
                  </p>
                  {slot.allGroups && <p style={{ margin:'3px 0 0',fontSize:11,color:C.muted }}>📍 {slot.location} · All Groups</p>}
                  {myAct && !slot.allGroups && myGroup && (
                    <div style={{ background:GROUPS[myGroup].bg,borderRadius:8,padding:'7px 10px',border:`1px solid ${GROUPS[myGroup].color}30` }}>
                      <p style={{ margin:'0 0 2px',fontSize:12,fontWeight:700,color:GROUPS[myGroup].color }}>{myAct.s}</p>
                      <p style={{ margin:0,fontSize:11,color:C.muted }}>📍 {myAct.l}</p>
                    </div>
                  )}
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
function CoffeePage({ myGroup }) {
  const C = useC()

  // wizard state
  const [step, setStep]       = useState(1)   // 1-5
  const [cat,  setCat]        = useState('')   // 'hot' | 'iced' | 'cold'
  const [drink,setDrink]      = useState('')
  const [size, setSize]       = useState('')
  const [milk, setMilk]       = useState('')
  const [syrups,setSyrups]    = useState([])   // [{ name, sf }]
  const [name, setName]       = useState('')
  const [pickup,setPickup]    = useState(true)
  const [deliverTo,setDeliverTo] = useState(() =>
    (!myGroup || myGroup === 'none') ? '' : (GROUPS[myGroup]?.delivery || '')
  )
  const [payMethod,setPayMethod] = useState('')  // 'tab' | 'counter'
  const [notes,setNotes]      = useState('')
  const [sent, setSent]       = useState(false)
  const [showSyrups,setShowSyrups] = useState(false)

  const isIced        = cat === 'iced'
  const isCold        = cat === 'cold'
  const needsSize     = cat !== 'cold'
  const syrupRequired = SYRUP_REQUIRED.has(drink)
  const showMilk      = !isCold && MILK_ELIGIBLE.has(drink)
  const syrupCount    = syrups.length
  const syrupPicked   = sName => syrups.find(s => s.name === sName)

  const toggleSyrup = sName => setSyrups(prev => {
    const exists = prev.find(s => s.name === sName)
    return exists ? prev.filter(s => s.name !== sName) : [...prev, { name:sName, sf:false }]
  })
  const toggleSF = sName => setSyrups(prev =>
    prev.map(s => s.name === sName ? { ...s, sf: !s.sf } : s)
  )

  const buildMsg = () => {
    const drinkLabel  = isIced ? `Iced ${drink}` : drink
    const sizeStr     = needsSize ? ` (${size})` : ''
    const milkStr     = milk ? `, ${milk}` : ''
    const syrupStr    = syrups.length
      ? `, ${syrups.map(s => s.sf ? `${s.name} SF` : s.name).join(' + ')} syrup`
      : ''
    const noteStr     = notes.trim() ? ` — ${notes.trim()}` : ''
    const deliveryStr = pickup
      ? ' (pickup)'
      : deliverTo.trim() ? ` (deliver → ${deliverTo.trim()})` : ' (pickup)'
    const payStr      = payMethod === 'tab' ? ' [on tab]' : ' [paying at pickup]'
    return `VBS Order from ${name.trim()}${deliveryStr}${payStr}: ${drinkLabel}${sizeStr}${milkStr}${syrupStr}${noteStr}`
  }

  const send = () => {
    window.location.href = `sms:${COFFEE_NUM}&body=${encodeURIComponent(buildMsg())}`
    setSent(true)
    setTimeout(() => setSent(false), 5000)
  }

  // ── shared header (steps 2-5) ──
  const WizHeader = ({ breadcrumb, onBack }) => (
    <div style={{ padding:'calc(14px + env(safe-area-inset-top,0px)) 16px 0', display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
      <Tap onClick={onBack} style={{ padding:'6px', marginLeft:-6, borderRadius:8 }}>
        <ChevronLeft size={22} color={C.text} />
      </Tap>
      <div style={{ flex:1 }}>
        <p style={{ margin:0, fontSize:12, color:C.muted }}>{breadcrumb}</p>
      </div>
      <div style={{ background:C.accentBg, border:`1px solid ${C.accentBdr}`, borderRadius:8, padding:'3px 10px' }}>
        <span style={{ fontSize:12, fontWeight:700, color:C.accent }}>$2 · All drinks</span>
      </div>
    </div>
  )

  // ── step progress dots ──
  const StepDots = () => (
    <div style={{ display:'flex', justifyContent:'center', gap:6, padding:'10px 0 18px' }}>
      {[1,2,3,4,5].map(n => (
        <div key={n} style={{
          width: n === step ? 18 : 6, height:6, borderRadius:99,
          background: n < step ? C.accent : n === step ? C.accent : C.border,
          opacity: n < step ? 0.4 : 1,
          transition:'all 0.3s ease'
        }} />
      ))}
    </div>
  )

  // ══════════════════════════════════════════════════════════════
  // STEP 1 — Category
  // ══════════════════════════════════════════════════════════════
  if (step === 1) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'calc(28px + env(safe-area-inset-top,0px)) 20px 8px' }}>
        <p style={{ margin:'0 0 2px', fontSize:11, fontWeight:700, letterSpacing:'.09em', textTransform:'uppercase', color:C.accent }}>The Café @ Gateway</p>
        <h2 style={{ margin:'0 0 4px', fontSize:30, fontWeight:700, color:C.text }}>Coffee</h2>
        <p style={{ margin:0, fontSize:13, color:C.muted }}>What are you feeling?</p>
        <StepDots />
      </div>

      <div style={{ padding:'0 20px calc(100px + env(safe-area-inset-bottom,0px))', display:'flex', flexDirection:'column', gap:12 }}>
        {Object.entries(MENU).map(([key, m]) => (
          <Tap key={key} onClick={() => { setCat(key); setDrink(''); setSize(''); setMilk(''); setSyrups([]); setStep(2) }}
            style={{ background:C.surface, border:`1.5px solid ${C.border}`, borderRadius:16, padding:'20px 18px', display:'flex', alignItems:'center', gap:16 }}>
            <span style={{ fontSize:36, lineHeight:1 }}>{m.emoji}</span>
            <div style={{ flex:1 }}>
              <p style={{ margin:'0 0 2px', fontSize:18, fontWeight:700, color:C.text }}>{m.label}</p>
              <p style={{ margin:0, fontSize:12, color:C.muted }}>
                {key==='hot' && 'Lattes, mochas, chai & more'}
                {key==='iced' && 'Cold versions of our hot drinks'}
                {key==='cold' && 'Italian sodas, smoothies & chills'}
              </p>
            </div>
            <ChevronRight size={20} color={C.muted} />
          </Tap>
        ))}

        <div style={{ background:C.accentBg, border:`1px solid ${C.accentBdr}`, borderRadius:12, padding:'10px 14px', marginTop:4 }}>
          <p style={{ margin:0, fontSize:12, color:C.accent, fontWeight:600, textAlign:'center' }}>All drinks $2 · Cold drinks are 16 oz</p>
        </div>
      </div>
    </div>
  )

  // ══════════════════════════════════════════════════════════════
  // STEP 2 — Drink
  // ══════════════════════════════════════════════════════════════
  if (step === 2) return (
    <div>
      <WizHeader
        breadcrumb={`${MENU[cat].emoji}  ${MENU[cat].label}`}
        onBack={() => setStep(1)}
      />
      <div style={{ padding:'0 16px calc(100px + env(safe-area-inset-bottom,0px))' }}>
        <h3 style={{ margin:'14px 0 4px', fontSize:22, fontWeight:700, color:C.text }}>Choose your drink</h3>
        <p style={{ margin:'0 0 4px', fontSize:13, color:C.muted }}>
          {isCold ? 'All 16 oz' : 'You\'ll pick a size next'}
        </p>
        <StepDots />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {MENU[cat].items.map(item => (
            <Tap key={item} onClick={() => { setDrink(item); setSize(''); setMilk(''); setSyrups([]); setShowSyrups(false); setStep(3) }}
              style={{ background:C.surface, border:`1.5px solid ${C.border}`, borderRadius:12, padding:'14px 13px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <p style={{ margin:0, fontSize:13, fontWeight:600, color:C.text, flex:1, lineHeight:1.3 }}>{item}</p>
              <ChevronRight size={14} color={C.muted} style={{ flexShrink:0, marginLeft:4 }} />
            </Tap>
          ))}
        </div>
      </div>
    </div>
  )

  // ══════════════════════════════════════════════════════════════
  // STEP 3 — Customize
  // ══════════════════════════════════════════════════════════════
  const canCustomize = (!needsSize || size) && (!syrupRequired || syrupCount > 0)

  if (step === 3) {
    const FL3 = ({ children, sub }) => (
      <div style={{ margin:'20px 0 8px', display:'flex', alignItems:'baseline', gap:6 }}>
        <p style={{ margin:0, fontSize:13, fontWeight:700, color:C.text }}>{children}</p>
        {sub && <span style={{ fontSize:11, color:C.muted }}>{sub}</span>}
      </div>
    )
    return (
      <div>
        <WizHeader
          breadcrumb={`${MENU[cat].emoji}  ${MENU[cat].label}  ›  ${isIced ? 'Iced ' : ''}${drink}`}
          onBack={() => setStep(2)}
        />
        <div style={{ padding:'0 16px calc(100px + env(safe-area-inset-bottom,0px))' }}>
          <h3 style={{ margin:'14px 0 2px', fontSize:22, fontWeight:700, color:C.text }}>{isIced ? `Iced ${drink}` : drink}</h3>
          <p style={{ margin:'0 0 4px', fontSize:13, color:C.muted }}>Customize your order</p>
          <StepDots />

          {/* Size */}
          {needsSize && (
            <>
              <FL3>Size</FL3>
              <div style={{ display:'flex', gap:8 }}>
                {SIZES.map(s => (
                  <Tap key={s} onClick={() => setSize(s)}
                    style={{ flex:1, padding:'12px 6px', borderRadius:10, border:`1.5px solid ${size===s?C.accent:C.border}`, background:size===s?C.accentBg:C.surface, textAlign:'center' }}>
                    <span style={{ fontSize:14, fontWeight:700, color:size===s?C.accent:C.muted }}>{s}</span>
                  </Tap>
                ))}
              </div>
            </>
          )}

          {/* Milk */}
          {showMilk && (
            <>
              <FL3 sub="(optional)">Milk alternative</FL3>
              <div style={{ display:'flex', gap:8 }}>
                {MILKS.map(m => (
                  <Tap key={m} onClick={() => setMilk(milk === m ? '' : m)}
                    style={{ flex:1, padding:'12px 6px', borderRadius:10, border:`1.5px solid ${milk===m?C.accent:C.border}`, background:milk===m?C.accentBg:C.surface, textAlign:'center' }}>
                    <span style={{ fontSize:13, fontWeight:700, color:milk===m?C.accent:C.muted }}>{m}</span>
                  </Tap>
                ))}
              </div>
            </>
          )}

          {/* Syrups */}
          <>
            <Tap onClick={() => setShowSyrups(p => !p)}
              style={{ background:C.surface, border:`1.5px solid ${syrupCount>0?C.accent:C.border}`, borderRadius:12, padding:'13px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:20, marginBottom:showSyrups?8:0 }}>
              <div>
                <span style={{ fontSize:14, fontWeight:600, color:syrupCount>0?C.accent:C.text }}>
                  {syrupCount > 0 ? `Syrup · ${syrups.map(s => s.sf ? `${s.name} SF` : s.name).join(', ')}` : 'Syrup'}
                </span>
                {syrupRequired && syrupCount === 0
                  ? <span style={{ fontSize:11, color:'#E05252', marginLeft:6 }}>required</span>
                  : <span style={{ fontSize:11, color:C.muted, marginLeft:6 }}>(optional)</span>
                }
              </div>
              <ChevronDown size={16} color={syrupCount>0?C.accent:C.muted}
                style={{ transform:showSyrups?'rotate(180deg)':'none', transition:'transform 0.2s ease', flexShrink:0 }} />
            </Tap>

            {showSyrups && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:8 }}>
                {SYRUPS.map(({ name:sName, sf:hasSF }) => {
                  const picked = syrupPicked(sName)
                  return (
                    <div key={sName}>
                      <Tap onClick={() => toggleSyrup(sName)}
                        style={{ background:picked?C.accentBg:C.surface, border:`1.5px solid ${picked?C.accent:C.border}`, borderRadius:10, padding:'9px 12px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <span style={{ fontSize:13, fontWeight:picked?700:500, color:picked?C.accent:C.text }}>{sName}</span>
                        {picked && <div style={{ width:6, height:6, borderRadius:'50%', background:C.accent, flexShrink:0 }} />}
                      </Tap>
                      {picked && hasSF && (
                        <Tap onClick={() => toggleSF(sName)}
                          style={{ marginTop:3, background:picked.sf?'rgba(22,163,74,0.15)':C.surfaceHi, border:`1px solid ${picked.sf?C.accent:C.border}`, borderRadius:7, padding:'4px 10px', textAlign:'center' }}>
                          <span style={{ fontSize:11, fontWeight:700, color:picked.sf?C.accent:C.muted }}>
                            {picked.sf ? '✓ Sugar Free' : 'Sugar Free?'}
                          </span>
                        </Tap>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>

          <Tap onClick={() => canCustomize && setStep(4)} disabled={!canCustomize}
            style={{ marginTop:24, padding:'15px', borderRadius:14, textAlign:'center', background:canCustomize?C.accent:C.surfaceHi, border:canCustomize?'none':`1px solid ${C.border}` }}>
            <span style={{ fontSize:15, fontWeight:700, color:canCustomize?'#fff':C.muted }}>
              {syrupRequired && syrupCount===0 ? 'Pick a syrup to continue' : !size && needsSize ? 'Pick a size to continue' : 'Continue →'}
            </span>
          </Tap>
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════
  // STEP 4 — Details (name, pickup, payment)
  // ══════════════════════════════════════════════════════════════
  const canDetails = name.trim() && payMethod

  if (step === 4) {
    const FL4 = ({ children, sub }) => (
      <div style={{ margin:'20px 0 8px', display:'flex', alignItems:'baseline', gap:6 }}>
        <p style={{ margin:0, fontSize:13, fontWeight:700, color:C.text }}>{children}</p>
        {sub && <span style={{ fontSize:11, color:C.muted }}>{sub}</span>}
      </div>
    )
    return (
      <div>
        <WizHeader
          breadcrumb={`${MENU[cat].emoji}  ${isIced ? 'Iced ' : ''}${drink}${size ? ` · ${size}` : ''}`}
          onBack={() => setStep(3)}
        />
        <div style={{ padding:'0 16px calc(100px + env(safe-area-inset-bottom,0px))' }}>
          <h3 style={{ margin:'14px 0 2px', fontSize:22, fontWeight:700, color:C.text }}>Your details</h3>
          <p style={{ margin:'0 0 4px', fontSize:13, color:C.muted }}>Almost done — just a few logistics</p>
          <StepDots />

          {/* Name */}
          <FL4>Your name</FL4>
          <SCard style={{ padding:'12px 14px' }}>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name..."
              style={{ width:'100%', background:'transparent', border:'none', outline:'none', fontSize:16, color:C.text, fontFamily:'inherit', padding:0 }} />
          </SCard>

          {/* Pickup or delivery */}
          <FL4>Pickup or delivery?</FL4>
          <div style={{ display:'flex', gap:8 }}>
            <Tap onClick={() => { setPickup(true); setPayMethod('') }}
              style={{ flex:1, padding:'12px', borderRadius:10, border:`1.5px solid ${pickup?C.accent:C.border}`, background:pickup?C.accentBg:C.surface, textAlign:'center' }}>
              <span style={{ fontSize:13, fontWeight:700, color:pickup?C.accent:C.muted }}>I'll pick it up</span>
            </Tap>
            <Tap onClick={() => { setPickup(false); setPayMethod('tab') }}
              style={{ flex:1, padding:'12px', borderRadius:10, border:`1.5px solid ${!pickup?C.accent:C.border}`, background:!pickup?C.accentBg:C.surface, textAlign:'center' }}>
              <span style={{ fontSize:13, fontWeight:700, color:!pickup?C.accent:C.muted }}>Deliver it</span>
            </Tap>
          </div>

          {!pickup && (
            <SCard style={{ padding:'12px 14px', marginTop:8 }}>
              <input value={deliverTo} onChange={e => setDeliverTo(e.target.value)}
                placeholder="Where? (e.g. Blue Group, Wild Games…)"
                style={{ width:'100%', background:'transparent', border:'none', outline:'none', fontSize:14, color:C.text, fontFamily:'inherit', padding:0 }} />
            </SCard>
          )}

          {/* Payment */}
          {pickup && (
            <>
              <FL4>How are you paying?</FL4>
              <div style={{ display:'flex', gap:8 }}>
                <Tap onClick={() => setPayMethod('tab')}
                  style={{ flex:1, padding:'12px 8px', borderRadius:10, border:`1.5px solid ${payMethod==='tab'?C.accent:C.border}`, background:payMethod==='tab'?C.accentBg:C.surface, textAlign:'center' }}>
                  <span style={{ fontSize:13, fontWeight:700, color:payMethod==='tab'?C.accent:C.muted }}>I'm on the tab</span>
                </Tap>
                <Tap onClick={() => setPayMethod('counter')}
                  style={{ flex:1, padding:'12px 8px', borderRadius:10, border:`1.5px solid ${payMethod==='counter'?C.accent:C.border}`, background:payMethod==='counter'?C.accentBg:C.surface, textAlign:'center' }}>
                  <span style={{ fontSize:13, fontWeight:700, color:payMethod==='counter'?C.accent:C.muted }}>Pay at counter</span>
                </Tap>
              </div>
              {payMethod === 'tab' && <p style={{ margin:'6px 0 0', fontSize:11, color:C.muted }}>Carolyn will deduct this from your tab balance</p>}
              {payMethod === 'counter' && <p style={{ margin:'6px 0 0', fontSize:11, color:C.muted }}>Cash or card — pay when you pick up</p>}
            </>
          )}

          <Tap onClick={() => canDetails && setStep(5)} disabled={!canDetails}
            style={{ marginTop:24, padding:'15px', borderRadius:14, textAlign:'center', background:canDetails?C.accent:C.surfaceHi, border:canDetails?'none':`1px solid ${C.border}` }}>
            <span style={{ fontSize:15, fontWeight:700, color:canDetails?'#fff':C.muted }}>
              {!name.trim() ? 'Enter your name to continue' : !payMethod ? 'Choose a payment method' : 'Review order →'}
            </span>
          </Tap>
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════
  // STEP 5 — Confirm + Send
  // ══════════════════════════════════════════════════════════════
  return (
    <div>
      <WizHeader
        breadcrumb={`${MENU[cat].emoji}  ${isIced ? 'Iced ' : ''}${drink}${size ? ` · ${size}` : ''}`}
        onBack={() => setStep(4)}
      />
      <div style={{ padding:'0 16px calc(100px + env(safe-area-inset-bottom,0px))' }}>
        <h3 style={{ margin:'14px 0 2px', fontSize:22, fontWeight:700, color:C.text }}>Confirm your order</h3>
        <p style={{ margin:'0 0 4px', fontSize:13, color:C.muted }}>Looks good? Hit send below.</p>
        <StepDots />

        {sent && (
          <div style={{ background:C.greenBg, border:`1px solid ${C.accentBdr}`, borderRadius:12, padding:'12px 16px', marginBottom:12, animation:'fadeUp 0.3s ease both', display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:18 }}>✅</span>
            <p style={{ margin:0, fontSize:14, color:C.green, fontWeight:600 }}>Order sent! Open your texts and tap send.</p>
          </div>
        )}

        {/* Order summary card */}
        <div style={{ background:C.surface, border:`1.5px solid ${C.border}`, borderRadius:16, overflow:'hidden', marginBottom:16 }}>
          <div style={{ background:C.accentBg, padding:'12px 16px', borderBottom:`1px solid ${C.accentBdr}` }}>
            <p style={{ margin:0, fontSize:11, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:C.accent }}>Your order</p>
          </div>
          <div style={{ padding:'14px 16px', display:'flex', flexDirection:'column', gap:10 }}>
            {/* Drink row */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <p style={{ margin:'0 0 2px', fontSize:16, fontWeight:700, color:C.text }}>{isIced ? `Iced ${drink}` : drink}</p>
                {size && <p style={{ margin:0, fontSize:13, color:C.muted }}>{size}</p>}
              </div>
              <span style={{ fontSize:13, fontWeight:700, color:C.accent }}>$2</span>
            </div>
            {/* Add-ons */}
            {(milk || syrups.length > 0) && (
              <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:8 }}>
                {milk && <p style={{ margin:'0 0 3px', fontSize:13, color:C.muted }}>+ {milk}</p>}
                {syrups.map(s => (
                  <p key={s.name} style={{ margin:'0 0 3px', fontSize:13, color:C.muted }}>
                    + {s.name}{s.sf ? ' (SF)' : ''} syrup
                  </p>
                ))}
              </div>
            )}
            {/* Delivery / payment */}
            <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:8, display:'flex', gap:6, flexWrap:'wrap' }}>
              <span style={{ fontSize:12, fontWeight:600, color:C.muted, background:C.surfaceHi, borderRadius:6, padding:'3px 8px' }}>
                {pickup ? 'Pickup' : `Deliver → ${deliverTo || '?'}`}
              </span>
              <span style={{ fontSize:12, fontWeight:600, color:C.muted, background:C.surfaceHi, borderRadius:6, padding:'3px 8px' }}>
                {payMethod === 'tab' ? 'On tab' : 'Pay at counter'}
              </span>
              <span style={{ fontSize:12, fontWeight:600, color:C.muted, background:C.surfaceHi, borderRadius:6, padding:'3px 8px' }}>
                {name}
              </span>
            </div>
          </div>
        </div>

        {/* Optional notes */}
        <p style={{ margin:'0 0 6px', fontSize:13, fontWeight:700, color:C.text }}>Notes <span style={{ fontSize:11, fontWeight:400, color:C.muted }}>(optional)</span></p>
        <SCard style={{ padding:'12px 14px', marginBottom:0 }}>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any other requests..."
            style={{ width:'100%', background:'transparent', border:'none', outline:'none', fontSize:14, color:C.text, fontFamily:'inherit', resize:'none', minHeight:48, padding:0 }} />
        </SCard>

        <Tap onClick={send}
          style={{ marginTop:16, padding:'16px', borderRadius:14, textAlign:'center', background:C.accent }}>
          <span style={{ fontSize:15, fontWeight:700, color:'#fff' }}>☕  Send Order via Text</span>
        </Tap>
        <p style={{ textAlign:'center', fontSize:11, color:C.muted, marginTop:8, marginBottom:0 }}>Opens your texting app — just hit send</p>

        <Tap onClick={() => { setStep(1); setCat(''); setDrink(''); setSize(''); setMilk(''); setSyrups([]); setName(''); setPayMethod(''); setNotes(''); setSent(false) }}
          style={{ marginTop:12, padding:'10px', borderRadius:10, textAlign:'center' }}>
          <span style={{ fontSize:13, color:C.muted }}>Start a new order</span>
        </Tap>
      </div>
    </div>
  )
}

// ─── CREW PAGE ────────────────────────────────────────────────────────────────
function CrewPage({ live }) {
  const C = useC()
  const dayData = live.dayIdx>=0 ? DAYS[live.dayIdx] : DAYS[0]

  return (
    <div>
      <div style={{ padding:'calc(22px + env(safe-area-inset-top,0px)) 16px 14px' }}>
        <h2 style={{ margin:'0 0 2px',fontSize:28,fontWeight:700,color:C.text }}>Crew</h2>
        <p style={{ margin:0,fontSize:13,color:C.muted }}>Resources for crew leaders</p>
      </div>

      <div style={{ padding:'0 16px calc(92px + env(safe-area-inset-bottom,0px))' }}>
        <div style={{ background:C.accentBg,border:`1px solid ${C.accentBdr}`,borderRadius:16,overflow:'hidden',marginBottom:12 }}>
          <div style={{ display:'flex',alignItems:'flex-end',gap:0 }}>
            <img src={BUDDY_IMGS[dayData.n]} alt={dayData.buddy} style={{ width:88,height:88,objectFit:'contain',flexShrink:0,marginLeft:8 }} />
            <div style={{ padding:'14px 16px 14px 10px',flex:1 }}>
              <p style={{ margin:'0 0 4px',fontSize:11,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',color:C.accent }}>Crew Icebreaker · Day {dayData.n}</p>
              <p style={{ margin:0,fontSize:14,color:C.text,lineHeight:1.5,fontStyle:'italic' }}>"{dayData.icebreaker}"</p>
            </div>
          </div>
        </div>

        <CrewKit />
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
  const mockOffset = (() => {
    try {
      const p = new URLSearchParams(window.location.search).get('t')
      if (p) { const d = new Date(p); if (!isNaN(d)) return d - Date.now() }
    } catch {}
    return 0
  })()
  const [now,setNow] = useState(() => new Date(Date.now() + mockOffset))
  const [changing,setChanging] = useState(false)

  useEffect(() => {
    const s = document.createElement('style'); s.textContent = GCSS; document.head.appendChild(s)
    return () => { try{document.head.removeChild(s)}catch{} }
  },[])

  useEffect(() => { const t=setInterval(()=>setNow(new Date(Date.now() + mockOffset)),60000); return()=>clearInterval(t) },[mockOffset])

  const live = getLive(now)

  if (splash) return <TC.Provider value={TH}><Splash onDone={()=>setSplash(false)} /></TC.Provider>
  const saveGroup = g => { try { localStorage.setItem('rfGroup', g) } catch {} setMyGroup(g) }
  if (!myGroup) return <TC.Provider value={TH}><GroupPicker onSelect={saveGroup} /></TC.Provider>

  return (
    <TC.Provider value={TH}>
      <div style={{ background:TH.bg,minHeight:'100vh',color:TH.text,fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",maxWidth:430,margin:'0 auto',position:'relative' }}>
        <div key={page} style={{ animation:'tabFade 220ms cubic-bezier(0.2,0,0,1) both' }}>
          {page==='today'    && <TodayPage myGroup={myGroup} live={live} now={now} onViewSchedule={()=>setPage('schedule')} onChangeGroup={()=>setChanging(true)} />}
          {page==='schedule' && <SchedulePage myGroup={myGroup} live={live} now={now} onChangeGroup={()=>setChanging(true)} />}
          {page==='coffee'   && <CoffeePage myGroup={myGroup} />}
          {page==='crew'     && <CrewPage live={live} />}
        </div>
        <BottomNav page={page} setPage={setPage} />
        {changing && <GroupModal myGroup={myGroup} onSelect={g=>{saveGroup(g);setChanging(false)}} onClose={()=>setChanging(false)} />}
      </div>
    </TC.Provider>
  )
}
