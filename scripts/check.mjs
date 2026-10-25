import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const web=path.resolve('www'),html=fs.readFileSync(path.join(web,'index.html'),'utf8');
const config=JSON.parse(fs.readFileSync('capacitor.config.json','utf8'));
if(config.appId!=='com.arbaz.cmaprep.studio'||config.server?.androidScheme!=='https'||config.server?.hostname)throw Error('Upgrade identity/origin changed. Keep the v1 app ID and web origin to preserve data.');
if(config.webDir!=='www'||config.server?.url)throw Error('The APK must use bundled offline web assets.');
for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))if(match[1].trim())new vm.Script(match[1]);
for(const filename of fs.readdirSync(web))if(filename.endsWith('.js'))new vm.Script(fs.readFileSync(path.join(web,filename),'utf8'),{filename});
for(const match of html.matchAll(/(?:src|href)="([^"?#]+)(?:[?#][^"]*)?"/g)){const file=match[1];if(/^(https?:|data:|#)/.test(file)||file.includes('${'))continue;if(file==='native.js'&&!fs.existsSync(path.join(web,file)))continue;if(!fs.existsSync(path.join(web,file)))throw Error('Missing web asset: '+file)}
if(!html.includes('subjects.js')||!html.includes('android-app.js')||!html.includes('app-config.js')||!html.includes('planner.js')||!html.includes('manage.js')||!html.includes('upgrade-guard.js')||!html.includes('purple.css'))throw Error('Required app modules are missing.');
for(const file of ['signing/cma-dev.p12.base64','.github/workflows/build-apk.yml'])if(!fs.existsSync(file))throw Error('Missing project file: '+file);
console.log('PASS: JavaScript syntax, offline configuration, assets and Android project inputs.');
