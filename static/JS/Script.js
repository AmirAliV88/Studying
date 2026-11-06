
const $ = id => document.getElementById(id);
const store = {
   get: k=>{ try { return localStorage.getItem(k); } catch { return null; } },
   set: (k, v)=>{ try { localStorage.setItem(k, v); return true; } catch { return false; } }
};
const faDigits = s => String(s).replace(/\d/g, d => '0123456789'[d]);
const fa = n => Number(n).toLocaleString('fa-IR');
function h(tag, cls, text){ const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }




//:: ----------------  تم / Theme  ----------------

const root = document.documentElement;
function setTheme(t, persist = true){
  root.dataset.theme = t;
  $('themeBtn').classList.toggle('active', t === 'dark');
  $('themeBtn').setAttribute('aria-pressed', t === 'dark');
  if (persist) store.set('theme', t);
}
setTheme(root.dataset.theme, false);
$('themeBtn').addEventListener('click', () => setTheme(root.dataset.theme==='dark'?'light':'dark'));




//:: ----------------   battery   ----------------

if (navigator.getBattery) {
   navigator.getBattery().then(b => {
      const upd = ()=>{
         $('batteryLevel').textContent = Math.round(b.level*100)+'%';
         $('battery').classList.toggle('charging', b.charging);
      }; upd();
      b.addEventListener('levelchange', upd); b.addEventListener('chargingchange', upd);
   }).catch(()=>{ $('batteryLevel').textContent = ''; });
} else { $('batteryLevel').textContent = ''; }




//:: ----------------  Liquid Glass Swithcer ----------------

document.querySelector("#LiquidSwitch").addEventListener("input", e=>{
   if (document.querySelector("#LiquidSwitch").checked){ 
      document.querySelectorAll(".glass").forEach(G=>{ G.style.backdropFilter = `${G.style.backdropFilter} url(#Glass) blur(2px)` }) 
   } else {
      document.querySelectorAll(".glass").forEach(G=>{ G.style.backdropFilter = G.style.backdropFilter.replace("url(#Glass)", "").trim() })
   }
})




//:: ----------------  Share ----------------

function LessonFormat(data){
  return `درس ${data["name"]} ${data["hours"]}h ${data["start"]!==""?`(شروع از ${data["start"]})`:''}`
}

function TestFormat(data){
  return `تست از درس ${data["lesson"]} \n\t درصد:${data["percent"]}  درست:${data["correct"]}  غلط:${data["wrong"]}  خالی:${data["blank"]}  ${data["neg"]!=0?`(با نمره منفی :${data["neg"]})`:''}`
}

const pad = n => String(n).padStart(2, '0');
const keyOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const Sharebtn = document.querySelector(".Share")

Sharebtn.addEventListener("click", ()=>{

  if (navigator.share) { try { 

    let Today = JSON.parse(localStorage.getItem("days"))[keyOf(new Date())], TEXT = ""
    Today["lessons"].forEach(l=>{ TEXT += LessonFormat(l)+"\n" }); Today["tests"].forEach(t=>{ TEXT += TestFormat(t)+"\n" })
    navigator.share({ text: TEXT }); } catch (e){null} 

  }
  else { 

    let Today = JSON.parse(localStorage.getItem("days"))[keyOf(new Date())], TEXT = ""
    Today["lessons"].forEach(l=>{ TEXT += LessonFormat(l)+"\n" }); Today["tests"].forEach(t=>{ TEXT += TestFormat(t)+"\n" })
    navigator.clipboard.writeText(TEXT); Sharebtn.classList.add("notsuppport"); document.querySelector("#cc").innerHTML = "Copyed"
    setTimeout(()=>{ document.querySelector("#cc").innerHTML = "" }, 2000)
    
  }

})




//:: ----------------  Help ----------------

const toggleHelp = open => { $('overlay').classList.toggle('open', open); $('overlay').setAttribute('aria-hidden', !open); };
$('helpBtn').addEventListener('click', () => toggleHelp(true));
$('closeBtn').addEventListener('click', () => toggleHelp(false));
$('overlay').addEventListener('click', e => { if (e.target === $('overlay')) toggleHelp(false); });
addEventListener('keydown', e => { if (e.key === 'Escape') toggleHelp(false); });




//:: ----------------  Profile Picture ----------------

const avatar = $('avatar'); const savedImg = store.get('profileImage');
if (savedImg) avatar.src = savedImg;
$('editBtn').addEventListener('click', () => $('fileInput').click());
$('fileInput').addEventListener('change', () => {
  const file = $('fileInput').files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, 512/Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = img.width*s; c.height = img.height*s;
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      const data = c.toDataURL('image/jpeg', .85);
      avatar.src = data; avatar.classList.remove('swap'); void avatar.offsetWidth; avatar.classList.add('swap');
      store.set('profileImage', data);
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file); $('fileInput').value = '';
});




//:: ----------------  Profile ----------------

const nameBox = $('nameBox'), nameEl = $('name'); let userName = store.get('profileName') || 'user';
nameEl.textContent = userName;
function startEdit(){
  if (nameBox.querySelector('input')) return;
  const input = h('input', 'name-input');
  input.value = userName; input.maxLength = 30;
  nameEl.replaceWith(input); input.focus(); input.select(); let done = false;
  const finish = save => {
    if (done) return; done = true; const v = input.value.trim();
    if (save && v) { userName = v; store.set('profileName', v); }
    nameEl.textContent = userName; input.replaceWith(nameEl);
    nameEl.style.animation = 'pop .6s var(--ease)';
    setTimeout(() => nameEl.style.animation = '', 700);
  };
  input.addEventListener('keydown', e => { if (e.key === 'Enter') finish(true); if (e.key === 'Escape') finish(false); });
  input.addEventListener('blur', () => finish(true));
}
nameEl.addEventListener('dblclick', startEdit);
let timer, sx, sy;
nameEl.addEventListener('pointerdown', e => {
  sx = e.clientX; sy = e.clientY; nameEl.classList.add('pressing');
  timer = setTimeout(() => { nameEl.classList.remove('pressing'); startEdit(); }, 550);
});
const cancel = () => { clearTimeout(timer); nameEl.classList.remove('pressing'); };
['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => nameEl.addEventListener(ev, cancel));
nameEl.addEventListener('pointermove', e => { if (Math.hypot(e.clientX - sx, e.clientY - sy) > 8) cancel(); });
nameEl.addEventListener('contextmenu', e => e.preventDefault());



//:: ----------------  Datas ----------------

//$
//$    localStorage['days'] = {
//$      "2026-11-02": {
//$        tests:   [{id, lesson, percent, correct, wrong, blank, neg}],
//$        lessons: [{id, name, hours, start}]
//$      }
//$    }

let days = {};
try { days = JSON.parse(store.get('days')||'{}')||{}; } catch { days = {}; }
Object.keys(days).forEach(k => {
  const d = days[k] || {};
  days[k] = { tests: Array.isArray(d.tests)?d.tests:[], lessons: Array.isArray(d.lessons)?d.lessons:[] };
});
const saveDays = () => store.set('days', JSON.stringify(days));
const todayKey = () => keyOf(new Date());
const fromKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m-1, d); };
const yesterdayKey = () => { const d = new Date(); d.setDate(d.getDate()-1); return keyOf(d); };
const count = k => days[k] ? days[k].tests.length+days[k].lessons.length:0;
const dFmt = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { day: 'numeric', month: 'long' });
const wFmt = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { weekday: 'long' });
const fullFmt = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const dayKeys = () => {
  const t = todayKey(), y = yesterdayKey();
  return [t, y, ...Object.keys(days).filter(k=>k!==t && k!==y && count(k)>0).sort().reverse()];
};
const dayLabel = k=>k===todayKey()?'امروز':k===yesterdayKey()?'دیروز':wFmt.format(fromKey(k));

const menu = $('menu'), dayBody = $('dayBody'); let selected = todayKey(), menuAnimated = false;

function renderMenu(){
  menu.textContent = '';
  dayKeys().forEach((k, i) => {
    const b = h('button', 'chip glass'+(k===selected?' active':''));
    b.type = 'button'; b.dataset.key = k;
    b.append(h('span', 'chip-l', dayLabel(k)), h('span', 'chip-d', dFmt.format(fromKey(k))));
    if (menuAnimated) b.style.animation = 'none'; else b.style.animationDelay = (.6+i*.15)+'s';
    b.addEventListener('click', () => select(k));
    menu.append(b);
  });
  menuAnimated = true;
}
const scrollActive = () => { const a = menu.querySelector('.chip.active'); if (a) a.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); };
function select(k){
  selected = k;
  menu.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.key === k));
  scrollActive(); renderDay();
}
// اسکرول افقی با چرخ ماوس
menu.addEventListener('wheel', e => {
  if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || menu.scrollWidth <= menu.clientWidth) return;
  e.preventDefault(); menu.scrollLeft -= e.deltaY;   // RTL
}, { passive: false });

function delBtn(kind, id, card){
  const b = h('button', 'del', '✕'); b.type = 'button'; b.setAttribute('aria-label', 'دیلیت');
  b.addEventListener('click', () => {
    card.classList.add('out');
    setTimeout(() => {
      const d = days[selected];
      d[kind] = d[kind].filter(x => x.id !== id);
      if (!count(selected)) delete days[selected];
      saveDays();
      if (!count(selected) && selected !== todayKey() && selected !== yesterdayKey()) selected = todayKey();
      renderMenu(); renderDay(); scrollActive();
    }, 650);
  });
  return b;
}
function testCard(t){
  const c = h('article', 'card glass');
  const top = h('div', 'card-top'); top.append(h('h5', 'card-title', t.lesson), delBtn('tests', t.id, c));
  const p = Math.max(0, Math.min(100, Number(t.percent) || 0));
  const bar = h('div', 'bar'), fill = h('i'); bar.append(fill);
  c.append(top, h('div', 'pct', fa(p) + '%'), bar);
  setTimeout(() => fill.style.width = p + '%', 400);
  const extras = [['درست', t.correct], ['غلط', t.wrong], ['خالی', t.blank], ['درست با منفی', t.neg]]
    .filter(([, v]) => v !== '' && v != null);
  if (extras.length) { const r = h('div', 'tags'); extras.forEach(([l, v]) => r.append(h('span', 'tag', l + ': ' + fa(v)))); c.append(r); }
  return c;
}
function lessonCard(l){
  const c = h('article', 'card glass');
  const top = h('div', 'card-top'); top.append(h('h5', 'card-title', l.name), delBtn('lessons', l.id, c));
  c.append(top, h('div', 'hours', fa(l.hours) + ' ساعت'));
  if (l.start) { const r = h('div', 'tags'); r.append(h('span', 'tag', 'شروع: ' + faDigits(l.start))); c.append(r); }
  return c;
}
function renderDay(){
  const d = days[selected] || { tests: [], lessons: [] };
  $('dayTitle').textContent = fullFmt.format(fromKey(selected));
  dayBody.textContent = '';
  let n = 0;
  const group = (title, arr, make) => {
    if (!arr.length) return;
    dayBody.append(h('h4', 'group', title));
    const g = h('div', 'cards');
    arr.forEach(it => { const c = make(it); c.style.animationDelay = (n++*.12) + 's'; g.append(c); });
    dayBody.append(g);
  };
  group('تست‌ها', d.tests, testCard);
  group('درس‌ها', d.lessons, lessonCard);
  if (!n) dayBody.append(h('div', 'empty', 'برای این روز چیزی ثبت نشده. با دکمه‌ی «افزودن» تست یا درس اضافه کن.'));
}

/* ---------- فرم افزودن ---------- */
const panel = $('panel'), form = $('addForm');
const closePanel = () => { panel.classList.remove('open', 'done'); };
$('addToggle').addEventListener('click', () => {
  if (panel.classList.contains('open')) return closePanel();
  $('fDate').value = selected; panel.classList.add('open');
});
panel.addEventListener('transitionend', e => {
  if (e.target === panel && e.propertyName === 'grid-template-rows' && panel.classList.contains('open')) panel.classList.add('done');
});
const segBtns = document.querySelectorAll('.seg button');
segBtns.forEach(b => b.addEventListener('click', () => {
  segBtns.forEach(x => x.classList.toggle('on', x === b));
  form.dataset.kind = b.dataset.kind;
  $('fsTest').disabled = b.dataset.kind !== 'test';
  $('fsLesson').disabled = b.dataset.kind !== 'lesson';
}));
form.addEventListener('submit', e => {
  e.preventDefault();
  const kind = form.dataset.kind, date = $('fDate').value;
  const num = id => $(id).value === '' ? '' : Number($(id).value);
  const text = id => $(id).value.trim();
  if (!date || (kind === 'test' ? !text('tLesson') : !text('lName'))) return;
  const item = kind === 'test'
    ? { id: Date.now(), lesson: text('tLesson'), percent: num('tPercent'), correct: num('tCorrect'), wrong: num('tWrong'), blank: num('tBlank'), neg: num('tNeg') }
    : { id: Date.now(), name: text('lName'), hours: num('lHours'), start: $('lStart').value };
  const day = days[date] || (days[date] = { tests: [], lessons: [] });
  day[kind === 'test' ? 'tests' : 'lessons'].push(item);
  saveDays(); form.reset(); closePanel();
  selected = date; renderMenu(); renderDay(); scrollActive();
});

renderMenu(); renderDay();