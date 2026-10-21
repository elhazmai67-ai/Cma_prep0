import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

window.CMA_NATIVE={
  isNative:Capacitor.isNativePlatform(),
  async saveFile(contents,mimeType,filename){
    const safeName=filename.replace(/[^a-zA-Z0-9._-]/g,'_');
    const saved=await Filesystem.writeFile({path:'exports/'+safeName,data:contents,directory:Directory.Cache,encoding:Encoding.UTF8,recursive:true});
    try{await Share.share({title:filename,files:[saved.uri],dialogTitle:filename.endsWith('.ics')?'Save or open calendar reminders':'Save your CMA Prep backup'});return true}
    catch(error){if(/cancel/i.test(error?.message||''))return false;throw error}
  },
  minimize:()=>App.minimizeApp()
};
if(Capacitor.isNativePlatform()){
  App.addListener('backButton',()=>window.dispatchEvent(new Event('cma:back'))).catch(()=>{});
  App.addListener('appStateChange',({isActive})=>window.dispatchEvent(new CustomEvent('cma:state',{detail:{isActive}}))).catch(()=>{});
}
