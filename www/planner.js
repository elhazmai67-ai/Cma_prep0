'use strict';

// Additive v2 fields only. V1 task IDs, dates, progress and histories stay intact.
function plannerUpgrade() {
  demoFeatures();
  for (const level of ['inter', 'final']) {
    const p = S.features.levels[level].plan;
    if (!p.dayNotes) p.dayNotes = {};
    p.manualMode = true;
  }
  S.upgradeVersion = 2;
}
plannerUpgrade();
planDate = addStudyDays(localDateKey(new Date()), 1);
ensurePlan = function () { plannerUpgrade(); return planData(); };

function dayPlan(date = planDate, level = S.level) {
  plannerUpgrade();
  const notes = S.features.levels[level].plan.dayNotes;
  return notes[date] || (notes[date] = { goal: '', note: '', ready: false, readyAt: null });
}
function plannerSubjects() { return [...L().subjects, ...featureLevel().vault.subjects]; }
function dayTasks(date = planDate) {
  return ensurePlan().tasks.filter(t => t.date === date).sort((a, b) => a.at - b.at || a.id.localeCompare(b.id));
}
function touchPlan(date, level = S.level) { const d = dayPlan(date, level); d.ready = false; d.readyAt = null; }
function openPlan(date) {
  if (!validStudyDate(date)) return;
  planDate = date; closeModal(); go('plan');
}
function minutesAt(value) {
  if (typeof value !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) throw Error('Choose a valid start time.');
  const [h, m] = value.split(':').map(Number); return h * 60 + m;
}
function planOverlap(date, at, minutes, except = '') {
  return dayTasks(date).find(t => t.id !== except && at < t.at + t.minutes && at + minutes > t.at);
}
function planSlot(date, minutes, preferred) {
  let at = preferred;
  for (const t of dayTasks(date)) {
    if (at + minutes <= t.at) break;
    if (at < t.at + t.minutes && at + minutes > t.at) at = t.at + t.minutes + 5;
  }
  return at + minutes <= 1440 ? at : null;
}
function blockForm(id = '') {
  const t = planData().tasks.find(t => t.id === id);
  if (t?.done) { toast('Reopen this block before editing its details.'); return; }
  const p = ensurePlan(), subjectId = t?.subject || active()?.id || '_general';
  const duration = t?.minutes || p.settings.block;
  const start = t ? t.at : planSlot(planDate, duration, minutesAt(p.settings.start)) ?? minutesAt(p.settings.start);
  showModal(t ? 'Make this block yours.' : 'One clear next step.', 'Choose exactly what you want to study, and when.', `
    <form id="manual-block-form" novalidate>
      <input type="hidden" name="id" value="${t?.id || ''}">
      <input type="hidden" name="level" value="${S.level}">
      <div class="fields"><div class="field"><label for="block-date">Study date</label><input id="block-date" type="date" name="date" value="${t?.date || planDate}" required></div>
      <div class="field"><label for="block-kind">Session type</label><select id="block-kind" name="kind">${[['study','Study / reading'],['lecture','Lecture'],['revision','Revision'],['practice','Practice']].map(([v,n])=>`<option value="${v}" ${v===(t?.kind||'study')?'selected':''}>${n}</option>`).join('')}</select></div></div>
      <div class="field"><label for="block-subject">Subject</label><select id="block-subject" name="subject"><option value="_general">General study</option>${plannerSubjects().map(s=>`<option value="${s.id}" ${s.id===subjectId?'selected':''}>${esc(s.name)}</option>`).join('')}</select></div>
      <div class="field"><label id="block-ref-label" for="block-ref">Chapter · optional</label><select id="block-ref" name="ref"></select></div>
      <div class="field" id="block-round-field"><label for="block-round">Revision round</label><select id="block-round" name="round">${[0,1,2].map(k=>`<option value="${k}" ${k===(t?.round||0)?'selected':''}>Round ${k+1}</option>`).join('')}</select></div>
      <div class="field"><label for="block-title">What will you do? · required</label><input id="block-title" name="title" value="${esc(t?.title||'')}" placeholder="e.g. Finish marginal costing examples" maxlength="1000" required></div>
      <div class="fields"><div class="field"><label for="block-start">Start time</label><input id="block-start" name="start" type="time" value="${clockLabel(start)}" required></div><div class="field"><label for="block-minutes">Duration · minutes</label><input id="block-minutes" name="minutes" type="number" min="1" max="720" value="${duration}" required></div></div>
      <p class="form-help" id="block-end" aria-live="polite"></p>
      <div class="field"><label for="block-note">Session note · optional</label><textarea id="block-note" name="note" maxlength="4000" placeholder="Pages, questions or one thing to remember…">${esc(t?.note||'')}</textarea></div>
      <p class="form-help">Blocks stay exactly where you put them. Overlapping times are checked before saving.</p>
      <p class="form-error" id="block-error" role="alert"></p>${actions(t?'Save changes':'Add study block')}
    </form>`);
  document.getElementById('block-subject').value = subjectId;
  fillBlockRefs(t?.ref || t?.chapter || ''); updateBlockEnd();
}
function fillBlockRefs(preferred = '') {
  const kind = document.getElementById('block-kind').value;
  const s = plannerSubjects().find(s => s.id === document.getElementById('block-subject').value);
  const items = kind === 'lecture' ? s?.lectures || [] : s?.chapters || [];
  const select = document.getElementById('block-ref');
  select.innerHTML = (kind === 'lecture' || kind === 'revision' ? '<option value="">Choose '+(kind==='lecture'?'a lecture':'a chapter')+'</option>' : '<option value="_custom">No chapter selected</option>') + items.map(x=>`<option value="${x.id}">${esc(x.title||x.name)}</option>`).join('');
  if (items.some(x=>x.id===preferred)) select.value = preferred;
  document.getElementById('block-ref-label').textContent = kind==='lecture'?'Lecture':kind==='revision'?'Chapter':'Chapter · optional';
  document.getElementById('block-round-field').hidden = kind!=='revision';
}
function updateBlockEnd() {
  const out = document.getElementById('block-end'); if (!out) return;
  try {
    const at=minutesAt(document.getElementById('block-start').value), n=Number(document.getElementById('block-minutes').value);
    out.textContent=Number.isInteger(n)&&n>0&&at+n<=1440?'Ends at '+clockLabel(at+n)+' · '+lectureDuration(n/60):'Choose a duration that finishes before midnight.';
  } catch { out.textContent='Choose your start time and duration.'; }
}
function saveStudyBlock(values) {
  if (values.level && values.level !== S.level) throw Error('Open the planner for this course again.');
  const p=ensurePlan(), existing=values.id?p.tasks.find(t=>t.id===values.id):null;
  if (values.id&&!existing) throw Error('This block no longer exists.');
  if (existing?.done) throw Error('Reopen the completed block before editing it.');
  const date=String(values.date||''), at=minutesAt(values.start), minutes=Number(values.minutes);
  const kind=values.kind, subjectId=values.subject||'_general', title=String(values.title||'').trim(), note=String(values.note||'');
  if (!validStudyDate(date)) throw Error('Choose a valid study date.');
  if (!Number.isInteger(minutes)||minutes<1||minutes>720||at+minutes>1440) throw Error('Choose 1–720 minutes and finish before midnight.');
  if (!title) throw Error('Write what you want to study in “What will you do?”.');
  if (!['study','lecture','revision','practice'].includes(kind)||title.length>1000||note.length>4000) throw Error('Add a valid session type and shorter title or note.');
  const s=plannerSubjects().find(s=>s.id===subjectId);
  if (subjectId!=='_general'&&!s) throw Error('Choose a subject that still exists.');
  let ref=values.ref||'_custom', round=Number(values.round||0);
  if (kind==='lecture'&&!s?.lectures.some(l=>l.id===ref)) throw Error('Add or select a lecture for this subject first.');
  if (kind==='revision'&&(!s?.chapters.some(c=>c.id===ref)||![0,1,2].includes(round))) throw Error('Choose a chapter and revision round.');
  if (['study','practice'].includes(kind)&&ref!=='_custom'&&!s?.chapters.some(c=>c.id===ref)) throw Error('Choose a valid chapter.');
  const overlap=planOverlap(date,at,minutes,existing?.id);
  if (overlap) throw Error('This overlaps “'+overlap.title+'” ('+clockLabel(overlap.at)+'–'+clockLabel(overlap.at+overlap.minutes)+'). Choose another time.');
  const before=JSON.parse(JSON.stringify({tasks:p.tasks,dayNotes:p.dayNotes,signature:p.signature}));
  const next={id:existing?.id||uid(),date,at,minutes,kind,subject:subjectId,ref,title,note,done:false,source:'manual'};
  if (kind==='revision') next.round=round;
  if (existing) { touchPlan(existing.date); Object.assign(existing,next); if(kind!=='revision') delete existing.round; }
  else p.tasks.push(next);
  touchPlan(date); p.signature='';
  if(!save()){Object.assign(p,before);throw Error('This device could not save the block. Your earlier plan is kept. Export a backup and check available storage before trying again.');}
  return next;
}
function suggestLectureSessions(date = planDate) {
  if (!validStudyDate(date)||date<localDateKey(new Date())) throw Error('Choose today or a future date for suggestions.');
  const p=ensurePlan();
  let budget=Math.max(0,p.settings.minutes-dayTasks(date).reduce((n,t)=>n+t.minutes,0)), count=0;
  const queue=L().subjects.flatMap(s=>s.lectures.filter(l=>!l.done).map(l=>({s,l,left:Math.max(0,Math.round(l.hours*60)-(p.lectureProgress[s.id+'|'+l.id]||0)-p.tasks.filter(t=>!t.done&&t.kind==='lecture'&&t.subject===s.id&&t.ref===l.id).reduce((n,t)=>n+t.minutes,0))}))).filter(x=>x.left>0);
  let at=minutesAt(p.settings.start);
  while (budget>0&&queue.some(x=>x.left>0)&&count<100) {
    let added=false;
    for(const item of queue) {
      if(item.left<=0||budget<=0) continue;
      const minutes=Math.min(item.left,p.settings.block,budget), slot=planSlot(date,minutes,at);
      if(slot===null) continue;
      p.tasks.push({id:uid(),date,at:slot,minutes,kind:'lecture',subject:item.s.id,ref:item.l.id,title:item.l.title,done:false,source:'suggested',note:''});
      at=slot+minutes+5; item.left-=minutes; budget-=minutes; count++; added=true;
    }
    if(!added) break;
  }
  if(count) touchPlan(date); save(); return count;
}
// Legacy callers now request suggestions explicitly; rendering never rebuilds a plan.
buildPlan=function(){suggestLectureSessions(planDate);return planData()};
plannerSettings=function(){const p=ensurePlan().settings;showModal('Space for a realistic day.','These settings guide suggestions. Your existing blocks keep their dates and times.',`<form id="manual-availability-form"><div class="fields"><div class="field"><label for="available-minutes">Study minutes per day</label><input id="available-minutes" name="minutes" type="number" min="1" max="1440" value="${p.minutes}" required></div><div class="field"><label for="available-start">Usual start time</label><input id="available-start" name="start" type="time" value="${p.start}" required></div></div><div class="field"><label for="available-block">Suggested block length · minutes</label><input id="available-block" name="block" type="number" min="1" max="720" value="${p.block}" required></div><label>Usual study days</label><div class="study-day-options">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((n,i)=>`<label><input type="checkbox" name="days" value="${i}" ${p.days.includes(i)?'checked':''}><span>${n}</span></label>`).join('')}</div><p class="form-help">You can still create your own blocks on any date, for any duration.</p><p id="availability-error" class="form-error" role="alert"></p>${actions('Save availability')}</form>`)};
completePlanTask=function(id){
  const p=ensurePlan(),t=p.tasks.find(t=>t.id===id);if(!t)return;
  const s=plannerSubjects().find(s=>s.id===t.subject);
  t.done=!t.done;
  if(t.kind==='lecture') {const l=s?.lectures.find(l=>l.id===t.ref);if(l){const key=s.id+'|'+l.id;p.lectureProgress[key]=Math.max(0,(p.lectureProgress[key]||0)+(t.done?t.minutes:-t.minutes));l.done=p.lectureProgress[key]>=Math.round(l.hours*60);}}
  else if(t.kind==='revision') {const c=s?.chapters.find(c=>c.id===t.ref);if(c){c.rounds[t.round]=t.done;for(const other of p.tasks)if(other.kind==='revision'&&other.subject===t.subject&&other.ref===t.ref&&other.round===t.round)other.done=t.done;if(t.done&&t.round<2&&!c.rounds[t.round+1]&&(!c.due[t.round+1]||c.due[t.round+1]<=localDateKey(new Date())))c.due[t.round+1]=addStudyDays(localDateKey(new Date()),t.round===0?3:7);}}
  else if(t.kind==='practice'&&s){const key=t.date+'|'+s.id;if(t.done)p.practiceDates[key]=true;else delete p.practiceDates[key];}
  save();render();toast(t.done?'Study block completed. Well done.':'Study block reopened.');
};
toggleLectureDone=function(id){const s=active(),l=s?.lectures.find(l=>l.id===id);if(!l)return;l.done=!l.done;const p=ensurePlan();p.lectureProgress[s.id+'|'+id]=l.done?Math.round(l.hours*60):0;for(const t of p.tasks)if(t.kind==='lecture'&&t.subject===s.id&&t.ref===id)t.done=l.done;save();render();toast(l.done?'Lecture complete. Your saved plan is kept.':'Lecture reopened. Your saved plan is kept.');};
let deletingBlock=null;
function requestBlockDelete(id){const t=ensurePlan().tasks.find(t=>t.id===id);if(!t)return;deletingBlock={id,level:S.level};showModal('Remove this study block?',esc(t.title),`<p class="form-help">This removes the block from your plan. Your lectures, chapters, notes and recorded learning progress are kept.</p><div class="modal-actions"><button class="btn btn-outline" data-action="close-modal">Keep block</button><button class="btn btn-delete" data-action="confirm-block-delete">Delete block</button></div>`)}
function removeStudyBlock(level,id){const p=S.features.levels[level].plan,t=p.tasks.find(t=>t.id===id);if(!t)return false;p.tasks=p.tasks.filter(t=>t.id!==id);touchPlan(t.date,level);save();return true;}
function markPlanReady(date=planDate){if(!dayTasks(date).length)throw Error('Add at least one study block before marking your plan ready.');const d=dayPlan(date);d.ready=true;d.readyAt=new Date().toISOString();save();}
function blockCard(t,compact=false){const s=plannerSubjects().find(s=>s.id===t.subject);return `<article class="night-block ${t.done?'is-done':''}"><div class="night-block-time"><b>${clockLabel(t.at)}</b><span>${clockLabel(t.at+t.minutes)}</span></div><button class="check-button ${t.done?'checked':''}" data-action="plan-done" data-id="${t.id}" role="checkbox" aria-checked="${t.done}" aria-label="${t.done?'Reopen':'Complete'} ${esc(t.title)}">${icon('check')}</button><div class="night-block-content"><span class="night-kind">${t.kind==='revision'?'Revision · R'+(t.round+1):t.kind==='lecture'?'Lecture':t.kind==='practice'?'Practice':'Study'}</span><h3>${esc(t.title)}</h3><p>${esc(s?.short||'General study')} · ${lectureDuration(t.minutes/60)}</p>${t.note&&!compact?`<p class="block-note">${esc(t.note)}</p>`:''}</div>${compact?'':`<div class="night-block-actions"><button class="icon-btn" data-action="edit-block" data-id="${t.id}" aria-label="Edit ${esc(t.title)}">${icon('settings')}</button><button class="icon-btn" data-action="delete-block" data-id="${t.id}" aria-label="Delete ${esc(t.title)}">${icon('trash')}</button></div>`}</article>`}
plan=function(){
  const p=ensurePlan(),d=dayPlan(),items=dayTasks(),used=items.reduce((n,t)=>n+t.minutes,0),completed=items.filter(t=>t.done).length;
  const todayKey=localDateKey(new Date()),tomorrow=addStudyDays(todayKey,1),isTomorrow=planDate===tomorrow;
  return `<div class="night-planner"><button class="text-btn back-home" data-action="nav" data-page="home">${icon('arrow')} Back to Home</button>`+head('PLAN TONIGHT. BEGIN WITH CLARITY.',isTomorrow?'Tomorrow starts<br><em>tonight.</em>':planDate===todayKey?'Your day.<br><em>Already decided.</em>':'A clear plan.<br><em>Your own pace.</em>','Decide once. Wake up knowing your next step.')+`
  <div class="night-grid"><div class="night-main">
  <section class="night-note panel"><div class="row between"><div class="field plan-date-field"><label for="night-date">Plan for</label><input id="night-date" type="date" value="${planDate}" aria-label="Study plan date"></div><span class="plan-status ${d.ready?'ready':''}">${icon(d.ready?'check':'moon')} ${d.ready?'Plan ready':'Draft · make it yours'}</span></div>
  <div class="date-jumps"><button data-action="open-day" data-date="${todayKey}" class="${planDate===todayKey?'selected':''}">Today</button><button data-action="open-day" data-date="${tomorrow}" class="${isTomorrow?'selected':''}">Tomorrow</button></div>
  <div class="field"><label for="night-goal">The one thing I want to finish</label><input id="night-goal" data-plan-field="goal" value="${esc(d.goal)}" maxlength="500" placeholder="e.g. Finish marginal costing and revise formulas"></div>
  <div class="field"><label for="night-note">A note for my morning self</label><textarea id="night-note" data-plan-field="note" maxlength="4000" placeholder="Start small. Phone away, water ready, one chapter at a time.">${esc(d.note)}</textarea></div>
  <div class="note-save-row"><span id="night-save-status" aria-live="polite">Saved automatically on this device</span><button class="text-btn" data-action="save-night-note">${icon('check')} Save note</button></div></section>
  <section class="night-sessions panel"><div class="row between"><h2>${isTomorrow?'Tomorrow’s':planDate===todayKey?'Today’s':'Planned'} sessions</h2><button class="text-btn" data-action="add-block">${icon('plus')} Add task</button></div><div class="session-summary"><span>${items.length} blocks · ${lectureDuration(used/60)} planned</span><span>${completed}/${items.length} done</span></div>
  <div class="night-block-list">${items.length?items.map(t=>blockCard(t)).join(''):`<div class="night-empty"><span class="subject-icon">${icon('calendar')}</span><h3>Make the first step obvious.</h3><p>Add a lecture, revision session or practice task.<br>Choose its time and make room for it.</p><button class="btn btn-outline" data-action="add-block">${icon('plus')} Add a study session</button></div>`}</div>
  <p class="night-tip">${icon('leaf')} ${used>p.settings.minutes?'You have planned more than your usual study time. Leave room for breaks.':'A realistic plan leaves room for breaks and a little breathing space.'}</p></section>
  </div><aside class="night-aside"><section class="night-ready panel"><span class="subject-icon">${icon('calendar')}</span><h2>Give tomorrow<br>a little head start.</h2><p>A clear plan is one less decision to make in the morning.</p><ol><li>Pick one meaningful goal</li><li>Give each task a time</li><li>Keep your plan ready</li></ol><button id="night-ready-button" class="btn btn-primary" data-action="ready-plan">${icon(d.ready?'check':'arrow')} ${d.ready?'Your plan is ready':'Mark plan ready'}</button><p class="ready-hint">On ${formatDate(planDate,{day:'numeric',month:'short'})}, this plan appears on Home automatically.</p></section>
  <section class="night-suggest panel"><h2>A starting point, if you need one.</h2><p>Fill free time from your unfinished lectures. Existing sessions stay exactly where they are.</p><button class="btn btn-outline" data-action="suggest-blocks">${icon('spark')} Suggest lecture sessions</button><button class="text-btn" data-action="planner-settings">Edit daily availability ${icon('arrow')}</button></section><button class="btn btn-outline revision-link" data-action="nav" data-page="revision">${icon('repeat')} Open revision room</button></aside></div>`+footer()+'</div>';
};
const v2OriginalHome=originalHome;
home=function(){
  const todayKey=localDateKey(new Date()),tomorrow=addStudyDays(todayKey,1),items=dayTasks(todayKey),d=dayPlan(todayKey),upcoming=dayTasks(tomorrow),ready=dayPlan(tomorrow).ready;
  const due=dueRevisions().length,missed=ensurePlan().tasks.filter(t=>!t.done&&t.date<todayKey);
  const content=`<div class="demo-home-tools"><button class="course-summary" data-action="syllabus-setup">${icon('book')}<span><small>YOUR COURSE</small><b>${esc(profileLabel())}</b></span>${icon('chevron')}</button><section class="today-overview panel"><div class="row between"><span class="eyebrow">TODAY, AT YOUR PACE</span><button class="text-btn" data-action="open-day" data-date="${todayKey}">Open plan ${icon('arrow')}</button></div><h2>${d.goal?esc(d.goal):items.length?'Your next steps are ready.':'Make space for what matters.'}</h2>${d.note?`<p class="morning-note">${esc(d.note)}</p>`:''}<div class="today-blocks">${items.length?items.slice(0,3).map(t=>blockCard(t,true)).join(''):'<p class="muted">Add your own blocks for today, or prepare tomorrow tonight.</p>'}</div>${items.length>3?`<button class="text-btn" data-action="open-day" data-date="${todayKey}">View all ${items.length} blocks ${icon('arrow')}</button>`:''}<div class="tomorrow-invite"><div>${icon('moon')}<span><b>${ready?'Tomorrow is ready.':'Tomorrow starts tonight.'}</b><small>${upcoming.length?upcoming.length+' blocks planned':'One clear plan. A calmer morning.'}</small></span></div><button class="btn btn-primary" data-action="open-day" data-date="${tomorrow}">${ready?'Review tomorrow':'Plan tomorrow'} ${icon('arrow')}</button></div></section>${missed.length?`<button class="due-home" data-action="open-day" data-date="${missed.sort((a,b)=>a.date.localeCompare(b.date))[0].date}">${icon('calendar')} ${missed.length} earlier blocks to review or reschedule ${icon('chevron')}</button>`:''}${due?`<button class="due-home" data-action="reminders">${icon('repeat')} ${due} revision reminders ready for you ${icon('chevron')}</button>`:''}</div>`;
  return v2OriginalHome().replace('<div class="home-grid">',content+'<div class="home-grid">');
};

document.addEventListener('click',async e=>{
  const b=e.target.closest('[data-action]');if(!b)return;const a=b.dataset.action;
  if(a==='open-day')openPlan(b.dataset.date);
  else if(a==='add-block')blockForm();
  else if(a==='edit-block')blockForm(b.dataset.id);
  else if(a==='delete-block')requestBlockDelete(b.dataset.id);
  else if(a==='confirm-block-delete'){if(deletingBlock)removeStudyBlock(deletingBlock.level,deletingBlock.id);deletingBlock=null;closeModal();render();toast('Block removed. Learning progress is kept.');}
  else if(a==='ready-plan'){try{markPlanReady();render();toast('Your plan is ready for '+formatDate(planDate,{day:'numeric',month:'short'})+'.');}catch(error){toast(error.message)}}
  else if(a==='save-night-note'){if(save())toast('Your goal and morning note are saved.');}
  else if(a==='suggest-blocks'){try{const count=suggestLectureSessions();render();toast(count?count+' lecture blocks added. You can edit every one.':'No extra lecture blocks fit. Add your own task, review existing plans or edit availability.');}catch(error){toast(error.message)}}
});
document.addEventListener('change',e=>{
  if(e.target.id==='night-date')openPlan(e.target.value);
  else if(['block-subject','block-kind'].includes(e.target.id))fillBlockRefs();
  else if(e.target.id==='block-ref'){const s=plannerSubjects().find(s=>s.id===document.getElementById('block-subject').value),kind=document.getElementById('block-kind').value,item=(kind==='lecture'?s?.lectures:s?.chapters)?.find(x=>x.id===e.target.value);if(item)document.getElementById('block-title').value=item.title||item.name;}
});
document.addEventListener('input',e=>{
  if(e.target.dataset.planField){const field=e.target.dataset.planField;if(!['goal','note'].includes(field))return;const d=dayPlan();d[field]=e.target.value.slice(0,field==='goal'?500:4000);touchPlan(planDate);const saved=save();const out=document.getElementById('night-save-status');if(out)out.textContent=saved?'Saved on this device · draft updated':'Could not save. Export a backup before leaving.';const status=document.querySelector('.plan-status');if(status){status.classList.remove('ready');status.textContent='Draft · updated';}const ready=document.getElementById('night-ready-button');if(ready)ready.innerHTML=icon('arrow')+' Mark plan ready';}
  if(['block-start','block-minutes'].includes(e.target.id))updateBlockEnd();
});
document.addEventListener('submit',e=>{
  // Named controls (including name="id") can shadow form.id in a real browser.
  const formId=e.target.getAttribute('id');
  if(!['manual-block-form','manual-availability-form'].includes(formId))return;e.preventDefault();const f=new FormData(e.target);
  try{
    if(formId==='manual-block-form'){const vals={};for(const k of ['id','level','date','start','minutes','kind','subject','ref','round','title','note'])vals[k]=f.get(k);const t=saveStudyBlock(vals);planDate=t.date;closeModal();render();toast('Study block saved. Your time, your plan.');}
    else{const minutes=Number(f.get('minutes')),block=Number(f.get('block')),start=f.get('start'),days=f.getAll('days').map(Number);minutesAt(start);if(!Number.isInteger(minutes)||minutes<1||minutes>1440||!Number.isInteger(block)||block<1||block>720||!days.length||days.some(d=>!Number.isInteger(d)||d<0||d>6))throw Error('Choose valid minutes, a block length and at least one study day.');ensurePlan().settings={minutes,start,block,days:[...new Set(days)]};save();closeModal();render();toast('Availability saved. Your existing blocks are kept.');}
  }catch(error){const out=document.getElementById(formId==='manual-block-form'?'block-error':'availability-error');if(out){out.textContent=error.message;out.scrollIntoView({block:'nearest',behavior:'smooth'});}toast(error.message);}
});
