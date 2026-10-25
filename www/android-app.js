'use strict';
window.addEventListener('cma:back',()=>{if(document.getElementById('modal').open){closeModal();return}if(page!=='home'){go('home');return}recordFocus();save();window.CMA_NATIVE?.minimize().catch(()=>{})});
window.addEventListener('cma:state',e=>{recordFocus();save();if(e.detail.isActive){tick();updateQuizTimers();render()}});
if(!window.CMA_UPGRADE?.blocked&&!featureLevel().profile.configured&&!L().subjects.length)showModal('Your study space, your way.','Start with your own subjects, or choose an optional CMA course template.',`<button class="btn btn-primary backup-wide" data-action="add-subject">${icon('plus')} Add my own subject</button><button class="btn btn-outline backup-wide" data-action="syllabus-setup" style="margin-top:12px">Choose a course template</button>`);
