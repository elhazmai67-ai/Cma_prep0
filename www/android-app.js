'use strict';
window.addEventListener('cma:back',()=>{if(document.getElementById('modal').open){closeModal();return}if(page!=='home'){go('home');return}recordFocus();save();window.CMA_NATIVE?.minimize().catch(()=>{})});
window.addEventListener('cma:state',e=>{recordFocus();save();if(e.detail.isActive){tick();updateQuizTimers();render()}});
if(!featureLevel().profile.configured&&!L().subjects.length)syllabusSetup();
