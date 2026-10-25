'use strict';

function editSubject(id) {
  const s=[...L().subjects,...featureLevel().vault.subjects].find(s=>s.id===id);if(!s)return;
  showModal('Your subject, in your words.','Changing the name keeps all lectures, chapters, results and study progress.',`<form id="edit-subject-form"><input type="hidden" name="id" value="${s.id}"><input type="hidden" name="level" value="${S.level}"><div class="field"><label for="edit-subject-name">Subject name</label><input id="edit-subject-name" name="name" value="${esc(s.name)}" maxlength="120" required></div><div class="field"><label for="edit-subject-color">Subject colour</label><select id="edit-subject-color" name="color">${[['purple','Lavender'],['green','Plum'],['blue','Blue'],['orange','Peach']].map(([v,n])=>`<option value="${v}" ${s.color===v?'selected':''}>${n}</option>`).join('')}</select></div><p class="form-error" id="subject-edit-error" role="alert"></p>${actions('Save subject')}</form>`);
}
function renameSubject(level,id,name,color) {
  const data=S.levels[level],f=S.features.levels[level],s=[...data.subjects,...f.vault.subjects].find(s=>s.id===id);
  if(!s)throw Error('This subject no longer exists.');name=String(name||'').trim();
  if(!name||name.length>120||!['green','orange','purple','blue'].includes(color))throw Error('Add a valid subject name and colour.');
  s.name=name;s.short=name;s.color=color;save();return s;
}
manageSubjects=function(){
  const rows=(items,hidden=false)=>items.map(s=>`<div class="manage-subject-row"><span class="subject-icon ${s.color}">${icon(s.ic)}</span><div><b>${esc(s.name)}</b><small>${s.lectures.length} lectures · ${s.chapters.length} chapters${hidden?' · Other group':''}</small></div><div class="manage-row-actions"><button class="icon-btn" data-action="edit-subject" data-id="${s.id}" aria-label="Edit ${esc(s.name)}">${icon('settings')}</button><button class="delete-subject-button" data-action="delete-subject" data-id="${s.id}" aria-label="Delete ${esc(s.name)}">${icon('trash')}</button></div></div>`).join('');
  showModal('Your subjects. Your choice.','Add your own subjects, rename them or manage their chapters.',`<div class="manage-subject-list">${rows(L().subjects)||'<p class="muted">No subjects yet. Start with your own subject below.</p>'}${featureLevel().vault.subjects.length?'<h3 class="archived-label">Saved from other groups</h3>'+rows(featureLevel().vault.subjects,true):''}</div><button class="btn btn-primary" style="margin-top:20px" data-action="add-subject">${icon('plus')} Add my own subject</button>`);
};
const lecturesBeforeManage=lectures;
lectures=function(){const s=active();let html=lecturesBeforeManage();if(!s)return html;return html.replace('<div class="toolbar">',`<div class="subject-workspace-actions"><button class="text-btn" data-action="add-subject">${icon('plus')} Add subject</button><button class="text-btn" data-action="edit-subject" data-id="${s.id}">${icon('settings')} Edit subject</button><button class="text-btn" data-action="subject-chapters" data-id="${s.id}">${icon('book')} Chapters (${s.chapters.length})</button></div><div class="toolbar">`);};
const revisionBeforeManage=revision;
revision=function(){let html=revisionBeforeManage();return html.replace(/<button class="delete-button" data-action="delete-chapter" data-id="([^"]+)"/g,(_m,id)=>`<button class="delete-button" data-action="edit-chapter" data-id="${id}" aria-label="Edit chapter name">${icon('settings')}</button><button class="delete-button" data-action="delete-chapter" data-id="${id}"`);};
function editChapter(id){const s=active(),c=s?.chapters.find(c=>c.id===id);if(!c)return;showModal('A chapter of your own.','Rename the chapter while keeping its notes and revision rounds.',`<form id="edit-chapter-form"><input type="hidden" name="id" value="${id}"><input type="hidden" name="subject" value="${s.id}"><input type="hidden" name="level" value="${S.level}"><div class="field"><label for="edit-chapter-name">Chapter name</label><input id="edit-chapter-name" name="name" maxlength="1000" value="${esc(c.name)}" required></div><p id="chapter-edit-error" class="form-error" role="alert"></p>${actions('Save chapter')}</form>`)}
function renameChapter(level,subjectId,id,name){const s=S.levels[level].subjects.find(s=>s.id===subjectId),c=s?.chapters.find(c=>c.id===id);name=String(name||'').trim();if(!c||!name||name.length>1000)throw Error('Add a valid chapter name.');const old=c.name;c.name=name;for(const t of S.features.levels[level].plan.tasks)if(t.subject===subjectId&&t.ref===id&&t.title===old)t.title=name;save();return c;}
const baseConfirmDelete=confirmDelete;
let studyDeleteRequest=null;
confirmDelete=function(type,id){
  if(!['chapter','lecture'].includes(type))return baseConfirmDelete(type,id);
  const s=active(),item=(type==='chapter'?s?.chapters:s?.lectures)?.find(x=>x.id===id);if(!item)return;
  studyDeleteRequest={type,id,subject:s.id,level:S.level};
  showModal('Delete this '+type+'?',esc(item.name||item.title),`<p class="form-help">Its ${type==='chapter'?'notes and revision progress':'lecture progress'} and linked study blocks will be removed. Your other subjects, chapters and lectures will be kept.</p><div class="modal-actions"><button class="btn btn-outline" data-action="close-modal">Keep ${type}</button><button class="btn btn-delete" data-action="confirm-study-delete">Delete ${type}</button></div>`);
};
function removeStudyEntry({type,id,subject:subjectId,level}){
  const s=S.levels[level].subjects.find(s=>s.id===subjectId),p=S.features.levels[level].plan;if(!s)return false;
  const list=type==='chapter'?'chapters':'lectures';if(!s[list].some(x=>x.id===id))return false;
  s[list]=s[list].filter(x=>x.id!==id);
  const linked=t=>t.subject===subjectId&&t.ref===id&&(type==='lecture'?t.kind==='lecture':t.kind!=='lecture');
  for(const t of p.tasks.filter(linked))touchPlan(t.date,level);p.tasks=p.tasks.filter(t=>!linked(t));
  if(type==='lecture'){
    delete p.lectureProgress[subjectId+'|'+id];
    const focus=focusData(),span=focus.spans.find(x=>x.id===focus.segmentId);
    if(focus.running&&span?.level===level&&span.subject===subjectId&&span.lecture===id)resetTimer(true);
    if(focus.lectures[subjectId]===id)delete focus.lectures[subjectId];
  }
  save();return true;
}
const removeSubjectBeforeUpgrade=removeSubject;
removeSubject=function(level,id){const dates=S.features.levels[level].plan.tasks.filter(t=>t.subject===id).map(t=>t.date);const removed=removeSubjectBeforeUpgrade(level,id);if(removed){for(const date of dates)touchPlan(date,level);save();}return removed;};
document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;const a=b.dataset.action;if(a==='edit-subject')editSubject(b.dataset.id);else if(a==='edit-chapter')editChapter(b.dataset.id);else if(a==='subject-chapters')go('revision',b.dataset.id);else if(a==='confirm-study-delete'){if(studyDeleteRequest)removeStudyEntry(studyDeleteRequest);studyDeleteRequest=null;closeModal();render();toast('Entry removed. Your other study data is kept.');}});
document.addEventListener('submit',e=>{const formId=e.target.getAttribute('id');if(!['edit-subject-form','edit-chapter-form'].includes(formId))return;e.preventDefault();const f=new FormData(e.target);try{if(formId==='edit-subject-form')renameSubject(f.get('level'),f.get('id'),f.get('name'),f.get('color'));else renameChapter(f.get('level'),f.get('subject'),f.get('id'),f.get('name'));closeModal();render();toast('Changes saved. Your progress is kept.');}catch(error){const out=document.getElementById(formId==='edit-subject-form'?'subject-edit-error':'chapter-edit-error');out.textContent=error.message;out.scrollIntoView({block:'nearest',behavior:'smooth'});}});
