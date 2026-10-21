'use strict';

// Focus spans store elapsed study time, independently of lecture length.
// Pausing, switching phases and resetting preserve already recorded time.
const focusModes={focus:{label:'Focus',short:'focus',key:'focus'},short:{label:'Short break',short:'break',key:'short'},long:{label:'Long break',short:'break',key:'long'}};
let focusInterval=null,lastFocusSave=0;
function focusData(){
  if(!S.pomodoro||S.pomodoro.version!==1)S.pomodoro={version:1,settings:{focus:25,short:5,long:15},mode:'focus',remainingMs:1500000,durationMs:1500000,running:false,endsAt:0,segmentId:null,cycle:0,subjects:{},lectures:{},spans:[],notice:''};
  const p=S.pomodoro;
  p.subjects=p.subjects||{};p.lectures=p.lectures||{};p.spans=Array.isArray(p.spans)?p.spans:[];
  return p;
}
function focusSubject(){const p=focusData();return L().subjects.find(s=>s.id===p.subjects[S.level])||L().subjects[0]}
function focusLecture(){const p=focusData(),s=focusSubject();return s?.lectures.find(l=>l.id===p.lectures[s.id])||s?.lectures.find(l=>!l.done)||s?.lectures[0]}
function lectureDuration(hours){const mins=Math.round(Number(hours)*60),h=Math.floor(mins/60),m=mins%60;return (h?h+'h':'')+(h&&m?' ':'')+(m?m+'m':'')||'0m'}
function studyDuration(ms){const sec=Math.floor(Math.max(0,ms)/1000),m=Math.floor(sec/60),h=Math.floor(m/60);return h?h+'h '+String(m%60).padStart(2,'0')+'m':m?m+' min':sec+' sec'}
function localDateKey(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function focusTotals(now=Date.now()){
  const p=focusData(),d=new Date(now);d.setHours(0,0,0,0);
  const monday=new Date(d);monday.setDate(monday.getDate()-((monday.getDay()+6)%7));
  const week=Array.from({length:7},(_,i)=>{const start=new Date(monday);start.setDate(start.getDate()+i);const end=new Date(start);end.setDate(end.getDate()+1);return {start:+start,end:+end,key:localDateKey(start),day:start.toLocaleDateString('en-GB',{weekday:'short'}),ms:0}});
  const todayKey=localDateKey(d);
  for(const span of p.spans){if(span.level!==S.level)continue;const end=p.running&&p.mode==='focus'&&p.segmentId===span.id?Math.max(span.end,Math.min(now,p.endsAt)):span.end;
    for(const day of week)day.ms+=Math.max(0,Math.min(end,day.end)-Math.max(span.start,day.start));}
  return {week,today:week.find(x=>x.key===todayKey)?.ms||0,total:week.reduce((a,x)=>a+x.ms,0),todayKey,monday};
}
function focusClock(ms){const s=Math.max(0,Math.ceil(ms/1000));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
function focusRemaining(){const p=focusData();return p.running?Math.max(0,p.endsAt-Date.now()):p.remainingMs}
function persistFocus(){save();lastFocusSave=Date.now()}
function recordFocus(now=Date.now()){
  const p=focusData();if(!p.running)return;
  if(p.mode==='focus'){
    const span=p.spans.find(s=>s.id===p.segmentId);
    if(span)span.end=Math.max(span.end,Math.min(now,p.endsAt));
  }
  p.remainingMs=Math.max(0,p.endsAt-now);
}
function stopFocusInterval(){clearInterval(focusInterval);focusInterval=null}
function ensureFocusInterval(){stopFocusInterval();if(focusData().running)focusInterval=setInterval(tick,500)}
function finishFocusPhase(){
  const p=focusData(),finished=p.mode;p.running=false;p.endsAt=0;p.segmentId=null;stopFocusInterval();
  if(finished==='focus'){p.cycle++;p.mode=p.cycle>=4?'long':'short';p.notice=p.mode==='long'?'Focus saved. Time for a longer break.':'Focus saved. Your short break is ready.';}
  else{if(finished==='long')p.cycle=0;p.mode='focus';p.notice='Break complete. Ready for your next focus?';}
  p.durationMs=p.settings[p.mode]*60000;p.remainingMs=p.durationMs;persistFocus();
  render();toast(p.notice);
}
function tick(){
  const p=focusData();if(p.running){recordFocus();if(p.remainingMs<=0){finishFocusPhase();return;}if(Date.now()-lastFocusSave>=2000)persistFocus();}
  updateTimerUI();
}
function toggleTimer(){
  const p=focusData();
  if(p.running){recordFocus();if(p.remainingMs<=0){finishFocusPhase();return;}p.running=false;p.endsAt=0;p.segmentId=null;stopFocusInterval();p.notice='Paused. Your study time is saved.';}
  else{
    if(p.mode==='focus'&&!focusSubject()){toast('Add a subject before starting a focus session.');return;}
    if(p.remainingMs<=0){p.remainingMs=p.settings[p.mode]*60000;p.durationMs=p.remainingMs;}
    p.notice='';p.running=true;const now=Date.now();p.endsAt=now+p.remainingMs;
    if(p.mode==='focus'){const s=focusSubject(),l=focusLecture();p.subjects[S.level]=s.id;if(l)p.lectures[s.id]=l.id;p.segmentId=uid();p.spans.push({id:p.segmentId,start:now,end:now,level:S.level,subject:s.id,lecture:l?.id||null});}
    else p.segmentId=null;
    ensureFocusInterval();
  }
  persistFocus();render();
}
function resetTimer(quiet=false){
  const p=focusData();recordFocus();p.running=false;p.endsAt=0;p.segmentId=null;stopFocusInterval();p.remainingMs=p.settings[p.mode]*60000;p.durationMs=p.remainingMs;p.notice='';persistFocus();updateTimerUI();if(!quiet){render();toast('Timer reset. Your recorded study time is kept.');}
}
function setFocusMode(mode){const p=focusData();if(!focusModes[mode]||p.mode===mode)return;resetTimer(true);p.mode=mode;p.durationMs=p.settings[mode]*60000;p.remainingMs=p.durationMs;p.notice='';persistFocus();render()}
function resetFocusData(){stopFocusInterval();delete S.pomodoro;focusData()}
function timerSettings(){const p=focusData();showModal('Your time, your rhythm.','Set a focus length and breaks that suit your study day.',`<form id="focus-settings-form"><div class="field"><label for="focus-minutes">Focus time · minutes</label><input id="focus-minutes" name="focus" type="number" inputmode="numeric" min="1" max="180" step="1" value="${p.settings.focus}" required><div class="time-presets">${[25,45,60].map(m=>`<button type="button" data-action="focus-preset" data-minutes="${m}">${m} min</button>`).join('')}</div></div><div class="fields"><div class="field"><label for="short-minutes">Short break · minutes</label><input id="short-minutes" name="short" type="number" inputmode="numeric" min="1" max="60" step="1" value="${p.settings.short}" required></div><div class="field"><label for="long-minutes">Long break · minutes</label><input id="long-minutes" name="long" type="number" inputmode="numeric" min="1" max="120" step="1" value="${p.settings.long}" required></div></div><p class="form-help">A long break is suggested after 4 completed focus sessions. Each next phase starts when you press Start.</p><p class="form-help">Changing times resets the current countdown. Your recorded study time is kept.</p>${actions('Save times')}</form>`)}
function timerCard(){const p=focusData();return `<section class="panel focus-shortcut"><span class="subject-icon">${icon('clock')}</span><div class="eyebrow">A LITTLE FOCUS GOES FAR</div><h2>One session at a time.</h2><p>${p.settings.focus} min of focus. A little break.<br>A little closer to your goal.</p><button class="btn btn-primary" data-action="nav" data-page="focus">${icon('play')} Open Focus</button><div class="shortcut-live" id="shortcut-live"></div></section>`}
function focusTracking(){const t=focusTotals();return `<aside class="focus-tracking"><section class="panel today-study"><div class="row between"><span class="eyebrow">TODAY'S STUDY TIME</span><span class="study-clock-icon">${icon('clock')}</span></div><div id="study-today" class="study-today">${studyDuration(t.today)}</div><p>CMA ${S.level==='inter'?'Inter':'Final'} · focus time only</p><div class="study-divider"></div><div class="row study-note">${icon('leaf')}<span>Every focused minute counts.</span></div></section><section class="panel weekly-study"><div class="row between"><h2>Weekly progress</h2><span id="study-week-total" class="pill pill-green">${studyDuration(t.total)}</span></div><p>${t.week[0].start?new Date(t.week[0].start).toLocaleDateString('en-GB',{day:'numeric',month:'short'}):''} – ${new Date(t.week[6].start).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</p><div class="focus-chart" id="focus-chart" role="img" aria-label="Study time for each day this week"></div><p id="weekly-note" class="weekly-note">Focus time appears here as you study.</p></section><p class="focus-privacy">${icon('shield')} Your progress stays on this device.</p></aside>`}
function focus(){const p=focusData(),s=focusSubject(),l=focusLecture();return `<div class="focus-page">${head('YOUR CALM CORNER','One session at a time.','Choose a topic. Find your rhythm. Take a real break.',`<button class="btn btn-outline" data-action="focus-settings">${icon('settings')} <span>Timer settings</span></button>`)}<div class="focus-layout"><div class="focus-main"><section class="focus-topic"><label for="focus-subject">What are you studying?</label><div class="focus-subject-row"><span class="subject-icon">${icon('book')}</span><select id="focus-subject" ${p.running?'disabled':''} aria-label="Choose focus subject">${L().subjects.length?L().subjects.map(x=>`<option value="${x.id}" ${x.id===s?.id?'selected':''}>${esc(x.name)}</option>`).join(''):'<option value="">Add a subject to get started</option>'}</select></div></section><section class="pomodoro-panel ${p.mode!=='focus'?'on-break':''}" aria-label="Pomodoro timer"><div class="pomodoro-tabs" aria-label="Timer phase">${Object.entries(focusModes).map(([k,v])=>`<button data-action="focus-mode" data-mode="${k}" class="${p.mode===k?'active':''}" aria-pressed="${p.mode===k}">${v.label}</button>`).join('')}</div><div class="focus-dial"><svg viewBox="0 0 300 300" aria-hidden="true"><circle class="dial-back" cx="150" cy="150" r="130"/><circle class="dial-progress" id="dial-progress" cx="150" cy="150" r="130"/></svg><div class="focus-dial-copy"><div class="eyebrow" id="focus-mode-label">${p.mode==='focus'?'TIME TO FOCUS':'TIME TO RECHARGE'}</div><div class="focus-digits" id="focus-digits">${focusClock(focusRemaining())}</div><div class="focus-status" id="focus-status">Ready when you are</div></div></div><div class="focus-controls"><button class="focus-start" id="focus-start" data-action="timer">${icon('play')} Start focus</button><button class="focus-reset" data-action="timer-reset" aria-label="Reset current timer">${icon('reset')}</button></div><div class="focus-notice" id="focus-notice" role="status">${esc(p.notice||'One thing at a time. You’ve got this.')}</div></section><button class="focus-settings-strip" data-action="focus-settings" aria-label="Edit focus and break durations"><span>${icon('clock')}<span><small>Focus</small><b>${p.settings.focus} min</b></span></span><span>${icon('leaf')}<span><small>Short break</small><b>${p.settings.short} min</b></span></span><span>${icon('sun')}<span><small>Long break</small><b>${p.settings.long} min</b></span></span><span class="edit-times">Edit ${icon('chevron')}</span></button><section class="focus-lecture-card"><div class="row between"><div class="eyebrow">WORKING ON</div>${s?`<button class="text-btn" data-action="focus-add-lecture">${icon('plus')} Add lecture</button>`:''}</div>${s?.lectures.length?`<label class="sr-only" for="focus-lecture">Choose lecture</label><select id="focus-lecture" ${p.running?'disabled':''}>${s.lectures.map(x=>`<option value="${x.id}" ${x.id===l?.id?'selected':''}>${esc(x.title)}${x.done?' · Done':''}</option>`).join('')}</select><div class="row between lecture-length-row"><p>${icon('video')} Lecture duration <strong>${lectureDuration(l?.hours||0)}</strong></p><button class="duration-edit" data-action="edit-focus-lecture" aria-label="Edit this lecture and its duration">Edit ${icon('chevron')}</button></div><p class="lecture-note">Your lecture length and focus timer are separate.</p>`:`<p class="no-focus-lectures">${s?'Add a lecture with its duration, or focus on general study for this subject.':'Add your first subject to begin.'}</p>${!s?'<button class="btn btn-soft" data-action="add-subject">Add subject</button>':''}`}</section></div>${focusTracking()}</div></div>`+footer()}
function updateFocusChart(){const host=document.getElementById('focus-chart');if(!host)return;const t=focusTotals(),max=Math.max(1800000,...t.week.map(x=>x.ms));host.innerHTML=t.week.map(d=>{const mins=d.ms/60000,label=d.ms?mins<1?'<1m':Math.floor(mins)+'m':'0';return `<div class="focus-day ${d.key===t.todayKey?'is-today':''}" title="${esc(d.day+': '+studyDuration(d.ms))}"><div class="day-plot"><span class="day-minutes">${label}</span><i style="height:${d.ms?Math.max(1,d.ms/max*100):0}%"></i></div><span class="day-label">${d.day.slice(0,1)}${d.key===t.todayKey?'<i></i>':''}</span></div>`}).join('');host.setAttribute('aria-label',t.week.map(d=>d.day+' '+studyDuration(d.ms)).join(', '));const total=document.getElementById('study-week-total');if(total)total.textContent=studyDuration(t.total);const note=document.getElementById('weekly-note');if(note)note.textContent=t.total?'Study time only. Breaks are excluded.':'Start a focus timer to fill your first day.'}
function updateTimerUI(){const p=focusData(),left=focusRemaining(),digits=document.getElementById('focus-digits');if(digits){digits.textContent=focusClock(left);const status=document.getElementById('focus-status');status.textContent=p.running?(p.mode==='focus'?'Just you and this topic.':'Breathe. Stretch. Come back fresh.'):left<p.durationMs?'Paused · time saved':'Ready when you are';const btn=document.getElementById('focus-start');btn.innerHTML=icon(p.running?'pause':'play')+(p.running?'Pause':left<p.durationMs?'Resume':p.mode==='focus'?'Start focus':'Start break');const ring=document.getElementById('dial-progress');ring.style.strokeDashoffset=816.814*(1-Math.min(1,left/p.durationMs));const td=document.getElementById('study-today');if(td)td.textContent=studyDuration(focusTotals().today);updateFocusChart();}
  const shortcut=document.getElementById('shortcut-live');if(shortcut)shortcut.textContent=p.running?focusModes[p.mode].label+' · '+focusClock(left)+' left':'Focus, break, repeat — at your pace.';
  document.title=p.running?focusClock(left)+' · '+focusModes[p.mode].label+' · CMA Prep':'CMA Prep · Your study space';
}
function addLectures(){lectureModal()}
function lectureModal(id=null,subjectId=active()?.id){const s=L().subjects.find(x=>x.id===subjectId);if(!s)return addSubject();const l=id?s.lectures.find(x=>x.id===id):null,mins=l?Math.round(l.hours*60):60;showModal(l?'Make this lecture yours.':'Add your next lecture.',esc(s.name),`<form id="lecture-detail-form"><input type="hidden" name="subject" value="${s.id}"><input type="hidden" name="lecture" value="${l?.id||''}"><div class="field"><label for="lecture-title">Lecture title</label><input id="lecture-title" name="title" value="${esc(l?.title||'')}" placeholder="e.g. Standard costing" maxlength="160" required></div><label>How long is this lecture?</label><div class="fields"><div class="field"><label for="lecture-hours" class="muted">Hours</label><input id="lecture-hours" name="hours" type="number" inputmode="numeric" min="0" max="99" step="1" value="${Math.floor(mins/60)}" required></div><div class="field"><label for="lecture-minutes" class="muted">Minutes</label><input id="lecture-minutes" name="minutes" type="number" inputmode="numeric" min="0" max="59" step="1" value="${mins%60}" required></div></div><p class="form-help">Every lecture can have a different length. Your focus timer is set separately.</p>${actions(l?'Save lecture':'Add lecture')}</form>`)}

document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;const a=b.dataset.action;
  if(a==='focus-settings')timerSettings();
  else if(a==='focus-preset')document.getElementById('focus-minutes').value=b.dataset.minutes;
  else if(a==='focus-mode')setFocusMode(b.dataset.mode);
  else if(a==='edit-lecture')lectureModal(b.dataset.id);
  else if(a==='edit-focus-lecture')lectureModal(focusLecture()?.id,focusSubject()?.id);
  else if(a==='focus-add-lecture')lectureModal(null,focusSubject()?.id);
});
document.addEventListener('change',e=>{const p=focusData();if(e.target.id==='focus-subject'){if(p.running)return;p.subjects[S.level]=e.target.value;persistFocus();render()}else if(e.target.id==='focus-lecture'){if(p.running)return;const s=focusSubject();if(s)p.lectures[s.id]=e.target.value;persistFocus();render()}});
document.addEventListener('input',e=>{if(['lecture-title','lecture-hours','lecture-minutes','focus-minutes','short-minutes','long-minutes'].includes(e.target.id))e.target.setCustomValidity('')});
document.addEventListener('submit',e=>{
  const form=e.target;if(!['focus-settings-form','lecture-detail-form'].includes(form.id))return;e.preventDefault();const fd=new FormData(form);
  if(form.id==='focus-settings-form'){
    const next={focus:Number(fd.get('focus')),short:Number(fd.get('short')),long:Number(fd.get('long'))};
    for(const [k,max]of [['focus',180],['short',60],['long',120]])if(!Number.isInteger(next[k])||next[k]<1||next[k]>max){const input=document.getElementById(k==='focus'?'focus-minutes':k+'-minutes');input.setCustomValidity('Choose a whole number between 1 and '+max+'.');input.reportValidity();return;}
    resetTimer(true);const p=focusData();p.settings=next;p.durationMs=next[p.mode]*60000;p.remainingMs=p.durationMs;persistFocus();closeModal();render();toast('Your focus and break times are updated.');
  }else{
    const s=L().subjects.find(x=>x.id===fd.get('subject')),title=fd.get('title').trim(),hours=Number(fd.get('hours')),mins=Number(fd.get('minutes'));if(!s)return;
    if(!title){const input=document.getElementById('lecture-title');input.setCustomValidity('Please enter a lecture title.');input.reportValidity();return;}
    if(!Number.isInteger(hours)||!Number.isInteger(mins)||hours<0||hours>99||mins<0||mins>59||hours*60+mins===0){const input=document.getElementById('lecture-minutes');input.setCustomValidity('Enter a duration of at least 1 minute, with minutes from 0 to 59.');input.reportValidity();return;}
    const id=fd.get('lecture'),existing=s.lectures.find(l=>l.id===id);
    if(existing){existing.title=title;existing.hours=(hours*60+mins)/60;}else{const l={id:uid(),title,hours:(hours*60+mins)/60,done:false};s.lectures.push(l);focusData().lectures[s.id]=l.id;}
    selected=s.id;filter='all';persistFocus();closeModal();render();toast(existing?'Lecture details saved.':'Lecture added with its own duration.');
  }
});
window.addEventListener('pagehide',()=>{recordFocus();persistFocus()});
document.addEventListener('visibilitychange',()=>{recordFocus();persistFocus()});
window.addEventListener('hashchange',()=>{const next=location.hash.slice(1);if(next==='plan'||nav.some(x=>x[0]===next)){page=next;render()}});
window.addEventListener('storage',e=>{if(e.key!==KEY||!e.newValue)return;try{const incoming=JSON.parse(e.newValue);if(incoming?.levels?.inter&&incoming?.levels?.final){S=incoming;focusData();ensureFocusInterval();tick();render()}}catch(error){}});
// The complete demo bootstraps after all feature modules are loaded.
