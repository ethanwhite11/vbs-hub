import { useState, useEffect, useRef, createContext, useContext } from "react"
import { Calendar, Coffee, Home, ChevronDown, ChevronRight, ChevronLeft, RefreshCw } from "lucide-react"

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const GCSS = `
  @keyframes splashIn   { 0%{opacity:0;transform:scale(0.5)} 60%{opacity:1;transform:scale(1.08)} 80%{transform:scale(0.96)} 100%{transform:scale(1)} }
  @keyframes splashText { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes tabFade    { from{opacity:0;transform:scale(0.99) translateY(4px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes fadeUp     { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes livePulse  { 0%,100%{opacity:1} 50%{opacity:0.35} }
  @keyframes wowReveal  { 0%{opacity:0;transform:scale(0.72) translateY(6px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes iceSpin    { 0%{opacity:1;transform:scale(1) rotate(0deg)} 100%{opacity:0;transform:scale(0.92) rotate(-2deg)} }
  * { -webkit-tap-highlight-color:transparent; box-sizing:border-box; }
  body { overscroll-behavior:none; margin:0; background:#F2F2F7; font-family:'Plus Jakarta Sans',system-ui,sans-serif; }
  button { font-family:inherit; }
  ::-webkit-scrollbar { width:0; }
`

// ─── THEME ────────────────────────────────────────────────────────────────────
const TH = {
  bg:'#F2F2F7', surface:'#ffffff', surfaceHi:'#f0f0f0',
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

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16)
  return `rgba(${r},${g},${b},${alpha})`
}
function makeGradient(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16)
  const dark = `rgb(${Math.round(r*0.6)},${Math.round(g*0.6)},${Math.round(b*0.6)})`
  return `linear-gradient(160deg, ${dark} 0%, ${hex} 100%)`
}
function makeTheme(color, bg, bdr) {
  return { ...TH, accent:color, accentBg:bg, accentBdr:bdr, brand:color, brandBg:bg, brandBdr:bdr, banBg:color, banBdr:bdr }
}

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
  orange:  [{s:'Bible Adventures',l:'West Wing 272 A'},{s:'Crafts',l:'West Wing 272 B'},{s:'Snack',l:'Classroom'},{s:'Worship',l:'Classroom'},{s:'Games',l:'Outside – Bowl'}],
  orange2: [{s:'Crafts',l:'West Wing 272 B'},{s:'Bible Adventures',l:'West Wing 272 A'},{s:'Snack',l:'Classroom'},{s:'Games',l:'Outside – Bowl'},{s:'Worship',l:'Classroom'}],
}

const STATION_EMOJI = {
  'Rooted Bible Adventures':      '📖',
  'Missions':                     '🌍',
  'Treetop Treats / Imagination': '🎨',
  'Wild Games':                   '🏃',
  'Worship':                      '🙌',
  'Bible Adventures':             '📖',
  'Crafts':                       '🎨',
  'Snack':                        '🍎',
  'Games':                        '🏃',
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
  hot:  { label:'Hot',  emoji:'☕', items:['Americano','Latte / Cappuccino','Almond Milk Latte','Oat Milk Latte','Breve Latte','Mocha','Caramel Macchiato','Chai Tea Latte','Dirty Chai Latte','London Fog','Hot Chocolate'] },
  iced: { label:'Iced', emoji:'❄️', items:['Americano','Latte / Cappuccino','Almond Milk Latte','Oat Milk Latte','Breve Latte','Mocha','Caramel Macchiato','Chai Tea Latte','Dirty Chai Latte'] },
  cold: { label:'Cold', emoji:'🧊', items:['Italian Soda','Joe Chill','Chai Chill','Smoothie'] },
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
const MILK_ELIGIBLE = new Set(['Americano','Latte / Cappuccino','Breve Latte','Mocha','Chai Tea Latte','Dirty Chai Latte','London Fog','Hot Chocolate'])
const SYRUP_REQUIRED = new Set(['Italian Soda'])
const EXTRAS = ['Extra Shot of Espresso','Bottled Water','Hot Tea','Biscotti','Trail Mix','Mentos']
const SIZES = ['16 oz']
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

function getActivity(g, slotIdx, rotKey) {
  const slot = SLOTS[slotIdx]
  if (!slot) return null
  if (slot.allGroups) return { s:slot.label, l:slot.location }
  if (slot.isRotation) return ROT[rotKey || g]?.[slot.rotIdx] || null
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
  return <p style={{ margin:'20px 0 8px', fontSize:13, fontWeight:600, color:C.muted }}>{children}</p>
}

function Bar({ pct, color }) {
  const C = useC()
  return <div style={{ height:3, background:C.track, borderRadius:99, overflow:'hidden' }}><div style={{ height:'100%', width:`${Math.min(100,Math.max(0,pct*100))}%`, background:color, borderRadius:99, transition:'width 30s linear' }} /></div>
}

// ─── SPLASH ───────────────────────────────────────────────────────────────────
function Splash({ onDone }) {
  const [out,setOut] = useState(false)
  const [logoErr,setLogoErr] = useState(false)
  useEffect(() => {
    document.body.style.background = '#0d1f15'
    const t1=setTimeout(()=>setOut(true),1600),t2=setTimeout(onDone,2100)
    return()=>{clearTimeout(t1);clearTimeout(t2);document.body.style.background=''}
  },[])
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

// ─── ONBOARDING MODAL ────────────────────────────────────────────────────────
const ONBOARD_STEPS = [
  { emoji:'🌿', title:'Welcome to Leader Hub', body:"Your VBS command center for the whole week. Here's a quick look at what's inside — takes about 30 seconds." },
  { emoji:'🏠', title:'Today Tab', body:'Your daily guide. Bible point, memory verse, icebreaker, crew reminders, and your animated daily buddy — all in one card deck. Swipe through each morning.' },
  { emoji:'📅', title:'Schedule Tab', body:"Your group's full station rotation with live tracking. A real-time countdown shows exactly what's up next and where to go." },
  { emoji:'☕', title:'The Café @ Gateway', body:'Order a $2 drink from The Café. Pick your drink, customize it, and send the order straight from your phone via text.' },
  { emoji:'📱', title:'Save to Your Home Screen', body:null, isHomeScreen:true },
]

function OnboardingModal({ onDone }) {
  const C = useC()
  const [step, setStep] = useState(0)
  const total = ONBOARD_STEPS.length
  const cur = ONBOARD_STEPS[step]
  const isLast = step === total - 1

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isAndroid = /Android/.test(navigator.userAgent)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || !!window.navigator.standalone

  const homeBody = isStandalone
    ? "You're already running from your home screen — you're all set! 🎉"
    : isIOS
    ? 'Tap the Share button at the bottom of Safari (the box with an arrow ↑), then tap "Add to Home Screen". It opens instantly like an app.'
    : isAndroid
    ? 'Tap the three-dot menu at the top right of Chrome, then tap "Add to Home Screen" or "Install app".'
    : 'In your browser menu, look for "Add to Home Screen" or "Install app" to save Leader Hub to your home screen.'

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:300,display:'flex',alignItems:'flex-end',backdropFilter:'blur(3px)',WebkitBackdropFilter:'blur(3px)' }}>
      <div style={{ background:C.surface,width:'100%',maxWidth:430,margin:'0 auto',borderRadius:'24px 24px 0 0',padding:`28px 22px calc(32px + env(safe-area-inset-bottom,0px))`,animation:'fadeUp 0.3s ease both',border:`1px solid ${C.border}` }}>
        <div style={{ fontSize:52,textAlign:'center',marginBottom:14,lineHeight:1 }}>{cur.emoji}</div>
        <h2 style={{ margin:'0 0 10px',fontSize:22,fontWeight:700,color:C.text,textAlign:'center' }}>{cur.title}</h2>
        <p style={{ margin:'0 0 20px',fontSize:15,color:C.muted,textAlign:'center',lineHeight:1.65 }}>
          {cur.isHomeScreen ? homeBody : cur.body}
        </p>

        {cur.isHomeScreen && !isStandalone && isIOS && (
          <div style={{ background:C.accentBg,border:`1px solid ${C.accentBdr}`,borderRadius:10,padding:'10px 14px',marginBottom:16,textAlign:'center' }}>
            <p style={{ margin:0,fontSize:12,color:C.accent,fontWeight:600 }}>Safari only — won't work in Chrome on iPhone</p>
          </div>
        )}

        <div style={{ display:'flex',justifyContent:'center',gap:6,marginBottom:20 }}>
          {ONBOARD_STEPS.map((_,i) => (
            <div key={i} style={{ width:i===step?18:6,height:6,borderRadius:99,background:i<=step?C.accent:C.border,transition:'all 0.3s ease' }} />
          ))}
        </div>

        <div style={{ display:'flex',gap:8 }}>
          {step > 0 && (
            <Tap onClick={()=>setStep(s=>s-1)} style={{ padding:'13px 18px',borderRadius:12,border:`1px solid ${C.border}`,textAlign:'center' }}>
              <span style={{ fontSize:14,color:C.muted }}>Back</span>
            </Tap>
          )}
          <Tap onClick={isLast ? onDone : ()=>setStep(s=>s+1)}
            style={{ flex:1,padding:'14px',borderRadius:12,background:C.accent,textAlign:'center' }}>
            <span style={{ fontSize:15,fontWeight:700,color:'#fff' }}>{isLast ? "Let's go! 🌿" : 'Next →'}</span>
          </Tap>
        </div>

        {!isLast && (
          <Tap onClick={onDone} style={{ marginTop:12,textAlign:'center' }}>
            <span style={{ fontSize:13,color:C.mutedLt }}>Skip intro</span>
          </Tap>
        )}
      </div>
    </div>
  )
}

// ─── NOW HERO — full-bleed T1, handles safe-area, owns the group badge ────────
function NowHero({ myGroup, live, onChangeGroup, onHelp, preschoolSub }) {
  const rotKey = myGroup === 'orange' ? (preschoolSub === 2 ? 'orange2' : 'orange') : myGroup
  const C = useC()
  const g = myGroup ? GROUPS[myGroup] : null
  const safePad = 'calc(22px + env(safe-area-inset-top,0px))'
  const greenBase = { background:makeGradient(C.accent), padding:`${safePad} 20px 26px`, borderRadius:'0 0 24px 24px' }
  const lightBase = { background:C.surface, padding:`${safePad} 20px 22px`, borderBottom:`1px solid ${C.border}` }

  const hasColorGroup = myGroup && myGroup !== 'none'
  const HelpBtn = ({ light }) => (
    <Tap onClick={onHelp} style={{ width:28,height:28,borderRadius:'50%',background:light?'rgba(255,255,255,0.2)':'rgba(0,0,0,0.06)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
      <span style={{ fontSize:13,fontWeight:700,color:light?'rgba(255,255,255,0.85)':C.muted,lineHeight:1 }}>?</span>
    </Tap>
  )
  const WhiteBadge = () => (
    <div style={{ display:'flex',alignItems:'center',gap:6 }}>
      <HelpBtn light />
      <Tap onClick={onChangeGroup} style={{ background:'rgba(255,255,255,0.2)',borderRadius:20,padding:'5px 12px',display:'flex',alignItems:'center',gap:5,flexShrink:0 }}>
        {hasColorGroup && <div style={{ width:7,height:7,borderRadius:'50%',background:'rgba(255,255,255,0.9)' }} />}
        <span style={{ fontSize:11,fontWeight:700,color:'#fff' }}>{hasColorGroup ? g.label.split(' ')[0] : 'Staff'}</span>
      </Tap>
    </div>
  )

  const ColorBadge = () => (
    <div style={{ display:'flex',alignItems:'center',gap:6 }}>
      <HelpBtn />
      <Tap onClick={onChangeGroup} style={{ background:hasColorGroup?g.bg:'rgba(0,0,0,0.05)',border:`1px solid ${hasColorGroup?g.color+'50':C.border}`,borderRadius:20,padding:'5px 12px',display:'flex',alignItems:'center',gap:5,flexShrink:0 }}>
        {hasColorGroup && <div style={{ width:7,height:7,borderRadius:'50%',background:g.color }} />}
        <span style={{ fontSize:11,fontWeight:700,color:hasColorGroup?g.color:C.muted }}>{hasColorGroup ? g.label.split(' ')[0] : 'Staff'}</span>
      </Tap>
    </div>
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
  const myAct = myGroup ? getActivity(myGroup, slotIdx, rotKey) : null
  const nextIdx = next ? SLOTS.indexOf(next) : -1
  const nextAct = myGroup && nextIdx >= 0 ? getActivity(myGroup, nextIdx, rotKey) : null
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

// ─── CARD DECK ────────────────────────────────────────────────────────────────
function CardDeck({ day }) {
  const C = useC()
  const scrollRef = useRef(null)
  const [activeDot, setActiveDot]     = useState(0)
  const [bibleRevealed, setBible]     = useState(false)
  const [verseFlipped, setVerse]      = useState(false)
  const [jokeIdx, setJokeIdx]         = useState(0)
  const [jokeRevealed, setJokeRev]    = useState(false)
  const [iceIdx, setIceIdx]           = useState(0)
  const [iceOut, setIceOut]           = useState(false)
  const [tipIdx, setTipIdx]           = useState(0)

  const W = 250, H = 350, PHOTO_H = 148

  const base = {
    flexShrink:0, width:W, height:H, borderRadius:22,
    position:'relative', overflow:'hidden',
    scrollSnapAlign:'start', display:'flex', flexDirection:'column',
    padding:`${PHOTO_H + 4}px 18px 16px`,
    background:'#fff',
    border:`1px solid ${C.border}`,
    boxShadow:'0 2px 8px rgba(0,0,0,0.06)',
  }

  const PhotoHdr = ({ src, pos = 'center center' }) => (
    <div style={{
      position:'absolute', top:0, left:0, right:0, height:PHOTO_H,
      backgroundImage:`url(${src})`,
      backgroundSize:'cover', backgroundPosition:pos,
      WebkitMaskImage:'linear-gradient(to bottom, black 50%, transparent 100%)',
      maskImage:'linear-gradient(to bottom, black 50%, transparent 100%)',
      pointerEvents:'none',
    }} />
  )

  const onScroll = () => {
    if (!scrollRef.current) return
    setActiveDot(Math.max(0, Math.min(4, Math.round(scrollRef.current.scrollLeft / (W + 12)))))
  }

  const spinIce = () => {
    if (iceOut) return
    setIceOut(true)
    setTimeout(() => { setIceIdx(i => (i+1) % ICEBREAKERS.length); setIceOut(false) }, 230)
  }

  const joke = JOKES[jokeIdx]

  return (
    <div>
      <div ref={scrollRef} onScroll={onScroll} style={{
        display:'flex', gap:12, overflowX:'auto', scrollSnapType:'x mandatory',
        scrollBehavior:'smooth', scrollbarWidth:'none', WebkitOverflowScrolling:'touch',
        paddingLeft:16, paddingRight:16, paddingBottom:4, scrollPaddingLeft:16,
      }}>

        {/* ── Card 1: Bible Point ── */}
        <Tap style={{ ...base }} onClick={() => setBible(b => !b)}>
          <PhotoHdr src="/bible-point-image.jpg" pos="center 30%" />
          <div style={{ position:'relative', display:'flex', flexDirection:'column', flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <div style={{ flex:1 }}>
                <p style={{ margin:'0 0 1px', fontSize:8, fontWeight:700, letterSpacing:'.10em', textTransform:'uppercase', color:C.muted }}>Day {day.n} · Bible Point</p>
                <p style={{ margin:0, fontSize:11, fontWeight:600, color:C.muted }}>{day.buddy}</p>
              </div>
              <img src={BUDDY_IMGS[day.n]} alt={day.buddy} style={{ width:32, height:32, objectFit:'contain', flexShrink:0 }} />
            </div>
            <p style={{ margin:0, fontSize:20, fontWeight:800, lineHeight:1.2, flex:1, color:C.text }}>{day.point}</p>
            <div style={{
              background:bibleRevealed ? C.accentBg : C.surfaceHi,
              border:`1px solid ${bibleRevealed ? C.accentBdr : C.border}`,
              borderRadius:12, height:44,
              display:'flex', alignItems:'center', justifyContent:'center',
              overflow:'hidden', marginTop:10,
            }}>
              {!bibleRevealed
                ? <span style={{ fontSize:11, fontWeight:700, color:C.muted }}>Tap · see the response</span>
                : <span key="wow" style={{ fontSize:15, fontWeight:800, color:C.accent, animation:'wowReveal 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}>"Wow, God!" 🙌</span>
              }
            </div>
          </div>
        </Tap>

        {/* ── Card 2: Memory Verse (3D flip) ── */}
        <div onClick={() => setVerse(v => !v)}
          style={{ flexShrink:0, width:W, height:H, borderRadius:22, scrollSnapAlign:'start', cursor:'pointer', perspective:'1000px' }}>
          <div style={{
            width:'100%', height:'100%', position:'relative',
            transformStyle:'preserve-3d',
            transition:'transform 0.55s cubic-bezier(0.4,0,0.2,1)',
            transform: verseFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}>
            {/* Front */}
            <div style={{
              position:'absolute', inset:0, borderRadius:22,
              backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden',
              overflow:'hidden', background:'#fff', border:`1px solid ${C.border}`,
              boxShadow:'0 2px 8px rgba(0,0,0,0.06)',
            }}>
              <div style={{ height:PHOTO_H, backgroundImage:'url(/memory-verse-image.jpg)', backgroundSize:'cover', backgroundPosition:'center 25%', flexShrink:0,
                WebkitMaskImage:'linear-gradient(to bottom, black 50%, transparent 100%)',
                maskImage:'linear-gradient(to bottom, black 50%, transparent 100%)',
                pointerEvents:'none' }} />
              <div style={{ padding:'6px 18px 16px', display:'flex', flexDirection:'column', height:`calc(100% - ${PHOTO_H}px)` }}>
                <p style={{ margin:'0 0 6px', fontSize:8, fontWeight:700, letterSpacing:'.10em', textTransform:'uppercase', color:C.muted }}>Memory Verse</p>
                <p style={{ margin:'0 0 8px', fontSize:21, fontWeight:800, color:C.text }}>{day.verseRef}</p>
                <p style={{ margin:0, fontSize:12, color:C.muted, lineHeight:1.6, flex:1, fontStyle:'italic', filter:'blur(3.5px)', userSelect:'none' }}>{day.verseText}</p>
                <div style={{ background:C.accentBg, border:`1px solid ${C.accentBdr}`, borderRadius:10, padding:'9px', textAlign:'center' }}>
                  <span style={{ fontSize:11, fontWeight:700, color:C.accent }}>↻  Flip to reveal</span>
                </div>
              </div>
            </div>
            {/* Back */}
            <div style={{
              position:'absolute', inset:0, borderRadius:22,
              backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden',
              transform:'rotateY(180deg)',
              background:C.surface, border:`2px solid ${C.accentBdr}`,
              display:'flex', flexDirection:'column', padding:'18px 18px 16px', overflow:'hidden',
            }}>
              <p style={{ margin:'0 0 10px', fontSize:8, fontWeight:700, letterSpacing:'.10em', textTransform:'uppercase', color:C.accent }}>{day.verseRef}</p>
              <p style={{ margin:0, fontSize:15, color:C.text, lineHeight:1.7, fontStyle:'italic', flex:1 }}>{day.verseText}</p>
              <p style={{ margin:'8px 0 0', fontSize:10, fontWeight:700, color:C.accent, opacity:.6 }}>← Tap to flip back</p>
            </div>
          </div>
        </div>

        {/* ── Card 3: Crew Joke ── */}
        <Tap style={{ ...base }} onClick={() => !jokeRevealed && setJokeRev(true)}>
          <PhotoHdr src="/crew-joke-image.jpg" />
          <div style={{ position:'relative', display:'flex', flexDirection:'column', flex:1 }}>
            <p style={{ margin:'0 0 8px', fontSize:8, fontWeight:700, letterSpacing:'.10em', textTransform:'uppercase', color:C.muted }}>Crew Joke 😂</p>
            <p style={{ margin:0, fontSize:14, fontWeight:700, lineHeight:1.5, flex:1, color:C.text }}>{joke.q}</p>
            <div style={{
              background:jokeRevealed ? C.accentBg : C.surfaceHi,
              border:`1px solid ${jokeRevealed ? C.accentBdr : C.border}`,
              borderRadius:12, height:54,
              position:'relative', overflow:'hidden',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              {!jokeRevealed && <span style={{ fontSize:11, fontWeight:700, color:C.muted, position:'relative', zIndex:1 }}>Tap to reveal punchline</span>}
              <div style={{
                position:'absolute', inset:0,
                display:'flex', alignItems:'center', justifyContent:'center', padding:'0 12px', textAlign:'center',
                transform: jokeRevealed ? 'translateY(0)' : 'translateY(110%)',
                transition:'transform 0.42s cubic-bezier(0.34,1.56,0.64,1)',
              }}>
                <span style={{ fontSize:14, fontWeight:800, color:C.accent }}>{joke.a}</span>
              </div>
            </div>
            {jokeRevealed && (
              <Tap onClick={e => { e.stopPropagation(); setJokeIdx(i=>(i+1)%JOKES.length); setJokeRev(false) }}
                style={{ marginTop:8, background:C.accentBg, border:`1px solid ${C.accentBdr}`, borderRadius:10, padding:'8px', textAlign:'center' }}>
                <span style={{ fontSize:11, fontWeight:700, color:C.accent }}>↻ Next joke · {jokeIdx+1}/{JOKES.length}</span>
              </Tap>
            )}
          </div>
        </Tap>

        {/* ── Card 4: Icebreaker ── */}
        <Tap style={{ ...base }} onClick={spinIce}>
          <PhotoHdr src="/crew-icebreaker-image.jpg" pos="center 35%" />
          <div style={{ position:'relative', display:'flex', flexDirection:'column', flex:1 }}>
            <p style={{ margin:'0 0 10px', fontSize:8, fontWeight:700, letterSpacing:'.10em', textTransform:'uppercase', color:C.muted }}>Crew Icebreaker ❓</p>
            <p style={{ margin:0, fontSize:14, fontWeight:700, lineHeight:1.6, flex:1, color:C.text,
              opacity:iceOut?0:1, transform:iceOut?'scale(0.94) rotate(-1.5deg)':'scale(1)',
              transition:'opacity 0.22s, transform 0.22s' }}>
              "{ICEBREAKERS[iceIdx]}"
            </p>
            <div onClick={e => e.stopPropagation()}>
              <Tap onClick={spinIce} style={{ background:C.accentBg, border:`1px solid ${C.accentBdr}`, borderRadius:10, padding:'10px', textAlign:'center', marginTop:10 }}>
                <span style={{ fontSize:12, fontWeight:700, color:C.accent }}>🎲 New question · {iceIdx+1}/{ICEBREAKERS.length}</span>
              </Tap>
            </div>
          </div>
        </Tap>

        {/* ── Card 5: Leader Tip ── */}
        <Tap style={{ ...base }} onClick={() => setTipIdx(i=>(i+1)%TIPS.length)}>
          <PhotoHdr src="/leader-tip-image.jpg" pos="center 42%" />
          <div style={{ position:'relative', display:'flex', flexDirection:'column', flex:1 }}>
            <p style={{ margin:'0 0 10px', fontSize:8, fontWeight:700, letterSpacing:'.10em', textTransform:'uppercase', color:C.muted }}>Leader Tip 🌿</p>
            <p style={{ margin:0, fontSize:14, fontWeight:600, lineHeight:1.6, flex:1, color:C.text }}>
              {TIPS[tipIdx].icon} {TIPS[tipIdx].tip}
            </p>
            <div onClick={e => e.stopPropagation()}>
              <div style={{ display:'flex', gap:8, marginTop:10 }}>
                <Tap onClick={() => setTipIdx(i=>(i-1+TIPS.length)%TIPS.length)}
                  style={{ flex:1, background:C.accentBg, border:`1px solid ${C.accentBdr}`, borderRadius:10, padding:'8px', textAlign:'center' }}>
                  <span style={{ fontSize:12, fontWeight:700, color:C.accent }}>‹ Prev</span>
                </Tap>
                <Tap onClick={() => setTipIdx(i=>(i+1)%TIPS.length)}
                  style={{ flex:1, background:C.accentBg, border:`1px solid ${C.accentBdr}`, borderRadius:10, padding:'8px', textAlign:'center' }}>
                  <span style={{ fontSize:12, fontWeight:700, color:C.accent }}>Next ›</span>
                </Tap>
              </div>
            </div>
            <p style={{ margin:'6px 0 0', textAlign:'center', fontSize:10, color:C.mutedLt }}>Tip {tipIdx+1} of {TIPS.length}</p>
          </div>
        </Tap>

        {/* trailing pad so last card can scroll into view */}
        <div style={{ flexShrink:0, width:4 }} />
      </div>

      {/* Scroll dots */}
      <div style={{ display:'flex', justifyContent:'center', gap:5, marginTop:10 }}>
        {[0,1,2,3,4].map(i => (
          <div key={i} onClick={() => scrollRef.current?.scrollTo({ left:i*(W+12), behavior:'smooth' })}
            style={{
              width:activeDot===i?18:6, height:6, borderRadius:99,
              background:activeDot===i?C.accent:C.border,
              transition:'all 0.3s cubic-bezier(0.34,1.56,0.64,1)', cursor:'pointer',
            }} />
        ))}
      </div>
    </div>
  )
}

// ─── TODAY PAGE ───────────────────────────────────────────────────────────────
function TodayPage({ myGroup, live, now, onChangeGroup, onHelp, preschoolSub, onToggleSub }) {
  const C = useC()
  const dayIdx = live.dayIdx >= 0 ? live.dayIdx : (now < new Date('2026-07-13') ? 0 : DAYS.length - 1)
  const day = DAYS[dayIdx]
  const og = GROUPS.orange

  return (
    <div>
      <NowHero myGroup={myGroup} live={live} onChangeGroup={onChangeGroup} onHelp={onHelp} preschoolSub={preschoolSub} />
      {myGroup === 'orange' && (
        <div style={{ display:'flex', gap:8, padding:'10px 16px 0' }}>
          <Tap onClick={() => onToggleSub(1)} style={{ flex:1, padding:'8px', borderRadius:10, border:`1.5px solid ${preschoolSub===1?og.color:C.border}`, background:preschoolSub===1?og.bg:C.surface, textAlign:'center' }}>
            <span style={{ fontSize:12, fontWeight:700, color:preschoolSub===1?og.color:C.muted }}>P1 · Ages 2–3</span>
          </Tap>
          <Tap onClick={() => onToggleSub(2)} style={{ flex:1, padding:'8px', borderRadius:10, border:`1.5px solid ${preschoolSub===2?og.color:C.border}`, background:preschoolSub===2?og.bg:C.surface, textAlign:'center' }}>
            <span style={{ fontSize:12, fontWeight:700, color:preschoolSub===2?og.color:C.muted }}>P2 · Ages 4–5</span>
          </Tap>
        </div>
      )}
      <div style={{ padding:'16px 0 calc(92px + env(safe-area-inset-bottom,0px))' }}>
        <p style={{ margin:'0 0 10px',fontSize:11,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',color:C.muted,paddingLeft:16 }}>Today</p>
        <CardDeck day={day} />
      </div>
    </div>
  )
}

// ─── SCHEDULE PAGE ────────────────────────────────────────────────────────────
function SchedulePage({ myGroup, live, now, onChangeGroup, preschoolSub, onToggleSub }) {
  const C = useC()
  const g = myGroup ? GROUPS[myGroup] : null
  const rotKey = myGroup === 'orange' ? (preschoolSub === 2 ? 'orange2' : 'orange') : myGroup
  const cur = now.getHours()*60 + now.getMinutes()
  const inVbs = ['live','before','after'].includes(live.status)

  const curIdx    = live.status === 'live' ? live.slotIdx : -1
  const pastCount = inVbs ? SLOTS.filter(s => cur > toMin(s.end)).length : 0
  const filledPct = Math.min(100, ((pastCount + (curIdx >= 0 ? live.progress : 0)) / SLOTS.length) * 100)
  const nextIdx   = curIdx >= 0 && curIdx < SLOTS.length - 1 ? curIdx + 1 : -1
  const curSlot   = curIdx >= 0 ? SLOTS[curIdx] : null
  const nextSlot  = nextIdx >= 0 ? SLOTS[nextIdx] : null
  const laterList = curIdx >= 0 ? SLOTS.slice(nextIdx >= 0 ? nextIdx + 1 : curIdx + 1) : []
  const laterBaseIdx = nextIdx >= 0 ? nextIdx + 1 : curIdx + 1

  const dName = (slot, i) =>
    slot.allGroups ? slot.label
    : (myGroup && myGroup !== 'none') ? (getActivity(myGroup, i, rotKey)?.s || 'Station Rotation')
    : 'Station Rotation'

  const dLoc = (slot, i) =>
    slot.allGroups ? slot.location
    : (myGroup && myGroup !== 'none') ? (getActivity(myGroup, i, rotKey)?.l || null)
    : null

  const dEmoji = (slot, i) => {
    if (!slot.isRotation) return slot.emoji
    const act = (myGroup && myGroup !== 'none') ? getActivity(myGroup, i, rotKey) : null
    return (act && STATION_EMOJI[act.s]) || slot.emoji
  }

  const minsUntil = slot => Math.max(0, toMin(slot.start) - cur)

  const showStrip = live.status === 'live' || live.status === 'after'
  const GREEN = '#16a34a'
  const GREEN_BG = 'rgba(22,163,74,0.10)'

  const rowStyle = isLast => ({
    display:'flex', alignItems:'center', gap:11, padding:'12px 14px',
    borderBottom: isLast ? 'none' : `1px solid ${C.border}`
  })

  const renderRow = (slot, realIdx, isLast) => (
    <div key={realIdx} style={rowStyle(isLast)}>
      <div style={{ width:34, height:34, borderRadius:9, background:slot.allGroups ? GREEN_BG : C.accentBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0 }}>
        {dEmoji(slot, realIdx)}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ margin:'0 0 1px', fontSize:14, fontWeight:600, color:C.text, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
          {dName(slot, realIdx)}
        </p>
        <p style={{ margin:0, fontSize:11, color:C.muted }}>
          {fmtTime(slot.start)}{dLoc(slot, realIdx) ? ` · ${dLoc(slot, realIdx)}` : ''}
          {slot.allGroups && <span style={{ color:GREEN, fontWeight:600 }}> · All Groups</span>}
        </p>
      </div>
    </div>
  )

  return (
    <div style={{ animation:'tabFade 0.3s ease both' }}>

      {/* Header */}
      <div style={{ padding:'calc(22px + env(safe-area-inset-top,0px)) 16px 14px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
          <h2 style={{ margin:0, fontSize:28, fontWeight:700, color:C.text }}>Schedule</h2>
          {myGroup && (
            <Tap onClick={onChangeGroup} style={{ background:g&&myGroup!=='none'?g.bg:'rgba(0,0,0,0.05)', border:`1px solid ${g&&myGroup!=='none'?g.color+'50':C.border}`, borderRadius:20, padding:'5px 12px', display:'flex', alignItems:'center', gap:6 }}>
              {g && myGroup !== 'none' && <div style={{ width:8, height:8, borderRadius:'50%', background:g.color }} />}
              <span style={{ fontSize:11, fontWeight:700, color:g&&myGroup!=='none'?g.color:C.muted }}>
                {g&&myGroup!=='none' ? g.label.split(' ')[0] : 'Staff'}
              </span>
            </Tap>
          )}
        </div>
        <p style={{ margin:0, fontSize:12, color:C.muted }}>July 13–17 · 9:00 AM – 12:00 PM daily</p>
        {myGroup === 'orange' && (
          <div style={{ display:'flex', gap:8, marginTop:10 }}>
            <Tap onClick={() => onToggleSub(1)} style={{ flex:1, padding:'8px', borderRadius:10, border:`1.5px solid ${preschoolSub===1?g.color:C.border}`, background:preschoolSub===1?g.bg:C.surface, textAlign:'center' }}>
              <span style={{ fontSize:12, fontWeight:700, color:preschoolSub===1?g.color:C.muted }}>P1 · Ages 2–3</span>
            </Tap>
            <Tap onClick={() => onToggleSub(2)} style={{ flex:1, padding:'8px', borderRadius:10, border:`1.5px solid ${preschoolSub===2?g.color:C.border}`, background:preschoolSub===2?g.bg:C.surface, textAlign:'center' }}>
              <span style={{ fontSize:12, fontWeight:700, color:preschoolSub===2?g.color:C.muted }}>P2 · Ages 4–5</span>
            </Tap>
          </div>
        )}
      </div>

      <div style={{ padding:'0 16px calc(92px + env(safe-area-inset-bottom,0px))' }}>

        {/* Journey Strip */}
        {showStrip && (
          <div style={{ background:C.surface, borderRadius:14, padding:'13px 14px 15px', marginBottom:10, border:`1px solid ${C.border}` }}>
            <p style={{ margin:'0 0 14px', fontSize:9, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:C.mutedLt }}>Your morning</p>

            <div style={{ position:'relative', height:44, display:'flex', alignItems:'center' }}>
              {/* Background track */}
              <div style={{ position:'absolute', top:'50%', left:4, right:4, height:2, background:C.border, transform:'translateY(-50%)', borderRadius:1 }} />
              {/* Filled track */}
              {filledPct > 0 && (
                <div style={{ position:'absolute', top:'50%', left:4, width:`calc(${filledPct / 100} * (100% - 8px))`, height:2, background:C.accent, transform:'translateY(-50%)', borderRadius:1 }} />
              )}

              <div style={{ display:'flex', width:'100%', justifyContent:'space-between', position:'relative', zIndex:1 }}>
                {SLOTS.map((slot, i) => {
                  const isPast = inVbs && cur > toMin(slot.end)
                  const isCur  = curIdx === i
                  const clr    = slot.allGroups ? GREEN : C.accent

                  if (isPast) return (
                    <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
                      <div style={{ width:20, height:20, borderRadius:'50%', background:clr, display:'flex', alignItems:'center', justifyContent:'center', border:`2px solid ${C.surface}` }}>
                        <span style={{ fontSize:9, lineHeight:1, color:'#fff' }}>✓</span>
                      </div>
                      <span style={{ fontSize:7, color:clr, fontWeight:700, whiteSpace:'nowrap' }}>{fmtTime(slot.start)}</span>
                    </div>
                  )

                  if (isCur) return (
                    <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
                      <div style={{ position:'relative', width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <div style={{ position:'absolute', top:-4, left:-4, right:-4, bottom:-4, borderRadius:'50%', background:hexToRgba(C.accent, 0.18), animation:'livePulse 2s ease infinite' }} />
                        <div style={{ width:28, height:28, borderRadius:'50%', background:C.accent, border:`3px solid ${C.surface}`, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', zIndex:1 }}>
                          <div style={{ width:8, height:8, borderRadius:'50%', background:'#fff' }} />
                        </div>
                      </div>
                      <span style={{ fontSize:7, color:C.accent, fontWeight:800 }}>NOW</span>
                    </div>
                  )

                  return (
                    <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
                      <div style={{
                        width:20, height:20, borderRadius:'50%',
                        background: slot.allGroups ? 'rgba(22,163,74,0.08)' : C.surfaceHi,
                        border: `2px ${slot.allGroups ? 'dashed' : 'solid'} ${slot.allGroups ? 'rgba(22,163,74,0.35)' : C.border}`
                      }} />
                      <span style={{ fontSize:7, color:slot.allGroups ? GREEN : C.mutedLt, fontWeight:600, whiteSpace:'nowrap' }}>{fmtTime(slot.start)}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <p style={{ margin:'10px 0 0', fontSize:11, color:C.muted, textAlign:'center' }}>
              {live.status === 'after'
                ? 'All done — great work today! 🎉'
                : `Stop ${curIdx + 1} of ${SLOTS.length} · ${SLOTS.length - curIdx - 1} stop${SLOTS.length - curIdx - 1 !== 1 ? 's' : ''} remaining`
              }
            </p>
          </div>
        )}

        {/* NOW card */}
        {curSlot && (
          <div style={{ background:makeGradient(C.accent), borderRadius:16, padding:'18px 20px', marginBottom:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'rgba(255,255,255,0.88)', animation:'livePulse 2s ease infinite' }} />
              <span style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.78)', letterSpacing:'.08em', textTransform:'uppercase' }}>
                Now · {fmtTime(curSlot.start)} – {fmtTime(curSlot.end)}
              </span>
            </div>
            <p style={{ margin:'0 0 4px', fontSize:28, fontWeight:800, color:'#fff', lineHeight:1.05 }}>
              {dEmoji(curSlot, curIdx)} {dName(curSlot, curIdx)}
            </p>
            {dLoc(curSlot, curIdx) && (
              <p style={{ margin:'0 0 16px', fontSize:13, color:'rgba(255,255,255,0.82)' }}>📍 {dLoc(curSlot, curIdx)}</p>
            )}
            <div style={{ height:3, background:'rgba(255,255,255,0.25)', borderRadius:99, overflow:'hidden', marginBottom:8 }}>
              <div style={{ height:'100%', width:`${Math.min(100,Math.max(0,live.progress*100))}%`, background:'#fff', borderRadius:99, transition:'width 30s linear' }} />
            </div>
            <span style={{ fontSize:12, color:'rgba(255,255,255,0.88)', fontWeight:600 }}>{live.minLeft} min left</span>
          </div>
        )}

        {/* Up Next */}
        {nextSlot && (
          <div style={{ marginBottom:10 }}>
            <p style={{ margin:'0 0 7px', fontSize:9, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:C.mutedLt }}>Up next</p>
            <div style={{ background:C.surface, borderRadius:14, padding:'12px 14px', border:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:42, height:42, borderRadius:11, background:nextSlot.allGroups ? GREEN_BG : C.accentBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:20 }}>
                {dEmoji(nextSlot, nextIdx)}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ margin:'0 0 2px', fontSize:16, fontWeight:700, color:C.text, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {dName(nextSlot, nextIdx)}
                </p>
                <p style={{ margin:0, fontSize:11, color:C.muted }}>
                  {fmtTime(nextSlot.start)}{dLoc(nextSlot, nextIdx) ? ` · ${dLoc(nextSlot, nextIdx)}` : ''}
                </p>
              </div>
              {minsUntil(nextSlot) > 0 && (
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <p style={{ margin:'0 0 2px', fontSize:13, fontWeight:700, color:C.accent }}>+{minsUntil(nextSlot)} min</p>
                  <p style={{ margin:0, fontSize:9, color:C.mutedLt }}>from now</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Later */}
        {laterList.length > 0 && (
          <div style={{ marginBottom:10 }}>
            <p style={{ margin:'0 0 7px', fontSize:9, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:C.mutedLt }}>Later</p>
            <div style={{ background:C.surface, borderRadius:14, border:`1px solid ${C.border}`, overflow:'hidden' }}>
              {laterList.map((slot, idx) => renderRow(slot, laterBaseIdx + idx, idx === laterList.length - 1))}
            </div>
          </div>
        )}

        {/* Before VBS / static fallback */}
        {(live.status === 'before' || !inVbs) && (
          <div>
            <p style={{ margin:'0 0 7px', fontSize:9, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:C.mutedLt }}>
              {live.status === 'before' ? "Today's schedule" : 'Daily schedule'}
            </p>
            <div style={{ background:C.surface, borderRadius:14, border:`1px solid ${C.border}`, overflow:'hidden' }}>
              {SLOTS.map((slot, i) => renderRow(slot, i, i === SLOTS.length - 1))}
            </div>
          </div>
        )}

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
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter your first and last name"
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
                style={{ width:'100%', background:'transparent', border:'none', outline:'none', fontSize:16, color:C.text, fontFamily:'inherit', padding:0 }} />
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

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
const TABS = [
  { id:'today',    label:'Today',    Icon:Home     },
  { id:'schedule', label:'Schedule', Icon:Calendar },
  { id:'coffee',   label:'Coffee',   Icon:Coffee   },
]

function BottomNav({ page, setPage }) {
  const C = useC()
  return (
    <div style={{ position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:430,background:C.navBg,borderTop:`1px solid ${C.border}`,paddingBottom:'env(safe-area-inset-bottom,0px)',display:'flex',zIndex:50,boxShadow:'0 -1px 12px rgba(0,0,0,0.06)' }}>
      {TABS.map(({id,label,Icon}) => {
        const on = page===id
        return (
          <button key={id} onClick={()=>setPage(id)} style={{ flex:1,background:'none',border:'none',cursor:'pointer',padding:'10px 0 8px',display:'flex',flexDirection:'column',alignItems:'center',gap:3 }}>
            <Icon size={22} strokeWidth={on?2.25:1.75} color={on?C.accent:C.muted} style={{ transition:'color 0.2s' }} />
            <span style={{ fontSize:10,fontWeight:on?700:500,color:on?C.accent:C.muted,letterSpacing:'0.04em',transition:'color 0.2s' }}>{label}</span>
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
  const [showOnboarding,setShowOnboarding] = useState(false)
  const mockOffset = (() => {
    try {
      const p = new URLSearchParams(window.location.search).get('t')
      if (p) { const d = new Date(p); if (!isNaN(d)) return d - Date.now() }
    } catch {}
    return 0
  })()
  const [now,setNow] = useState(() => new Date(Date.now() + mockOffset))
  const [changing,setChanging] = useState(false)
  const [preschoolSub,setPreschoolSub] = useState(1)

  useEffect(() => {
    const s = document.createElement('style'); s.textContent = GCSS; document.head.appendChild(s)
    return () => { try{document.head.removeChild(s)}catch{} }
  },[])

  useEffect(() => { const t=setInterval(()=>setNow(new Date(Date.now() + mockOffset)),60000); return()=>clearInterval(t) },[mockOffset])

  const live = getLive(now)

  if (splash) return <TC.Provider value={TH}><Splash onDone={()=>setSplash(false)} /></TC.Provider>
  const saveGroup = g => {
    try { localStorage.setItem('rfGroup', g) } catch {}
    setMyGroup(g)
    try { if (!localStorage.getItem('vbsOnboarding')) setShowOnboarding(true) } catch {}
  }
  const dismissOnboarding = () => {
    try { localStorage.setItem('vbsOnboarding','done') } catch {}
    setShowOnboarding(false)
  }
  if (!myGroup) return <TC.Provider value={TH}><GroupPicker onSelect={saveGroup} /></TC.Provider>

  const activeTheme = (() => {
    if (myGroup && myGroup !== 'none') {
      const g = GROUPS[myGroup]
      return makeTheme(g.color, g.bg, g.dark)
    }
    const di = live.dayIdx >= 0 ? live.dayIdx : (live.status === 'done' ? DAYS.length - 1 : 0)
    const dayColor = DAYS[di].accentColor
    return makeTheme(dayColor, hexToRgba(dayColor, 0.10), hexToRgba(dayColor, 0.28))
  })()

  return (
    <TC.Provider value={activeTheme}>
      <div style={{ background:TH.bg,minHeight:'100vh',color:TH.text,fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",maxWidth:430,margin:'0 auto',position:'relative' }}>
        <div key={page} style={{ animation:'tabFade 220ms cubic-bezier(0.2,0,0,1) both' }}>
          {page==='today'    && <TodayPage myGroup={myGroup} live={live} now={now} onChangeGroup={()=>setChanging(true)} onHelp={()=>setShowOnboarding(true)} preschoolSub={preschoolSub} onToggleSub={setPreschoolSub} />}
          {page==='schedule' && <SchedulePage myGroup={myGroup} live={live} now={now} onChangeGroup={()=>setChanging(true)} preschoolSub={preschoolSub} onToggleSub={setPreschoolSub} />}
          {page==='coffee'   && <CoffeePage myGroup={myGroup} />}
        </div>
        <BottomNav page={page} setPage={setPage} />
        {changing && <GroupModal myGroup={myGroup} onSelect={g=>{saveGroup(g);setChanging(false)}} onClose={()=>setChanging(false)} />}
        {showOnboarding && <OnboardingModal onDone={dismissOnboarding} />}
      </div>
    </TC.Provider>
  )
}
