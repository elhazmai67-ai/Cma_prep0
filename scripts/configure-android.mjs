import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('android'),res=path.join(root,'app/src/main/res');
if(!fs.existsSync(path.join(root,'app/build.gradle')))throw Error('Run npx cap add android and npx cap sync android first.');
const write=(relative,content)=>{const dest=path.join(res,relative);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,content)};
// Preserve the supplied artwork. Android scales the bitmap for each launcher density.
write('drawable-nodpi/cma_icon.png',fs.readFileSync('www/assets/cma-logo.png'));
for(const dir of fs.readdirSync(res))if(dir.startsWith('mipmap-'))for(const name of fs.readdirSync(path.join(res,dir)))if(/^ic_launcher(?:_round|_foreground)?\.(png|webp|xml)$/.test(name))fs.unlinkSync(path.join(res,dir,name));
const bitmap='<?xml version="1.0" encoding="utf-8"?>\n<bitmap xmlns:android="http://schemas.android.com/apk/res/android" android:src="@drawable/cma_icon" android:gravity="fill" />\n';
write('mipmap-anydpi/ic_launcher.xml',bitmap);write('mipmap-anydpi/ic_launcher_round.xml',bitmap);
write('drawable/cma_icon_foreground.xml','<?xml version="1.0" encoding="utf-8"?>\n<inset xmlns:android="http://schemas.android.com/apk/res/android" android:inset="18dp"><bitmap android:src="@drawable/cma_icon" android:gravity="fill" /></inset>\n');
const adaptive='<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android"><background android:drawable="@android:color/white"/><foreground android:drawable="@drawable/cma_icon_foreground"/></adaptive-icon>\n';
write('mipmap-anydpi-v26/ic_launcher.xml',adaptive);write('mipmap-anydpi-v26/ic_launcher_round.xml',adaptive);
// This is a public development certificate, only for personal test APKs.
fs.writeFileSync('signing/cma-dev.p12',Buffer.from(fs.readFileSync('signing/cma-dev.p12.base64','utf8').trim(),'base64'));
const gradlePath=path.join(root,'app/build.gradle');let gradle=fs.readFileSync(gradlePath,'utf8');
const signing=`    // CMA DEVELOPMENT SIGNING\n    signingConfigs {\n        debug {\n            storeFile rootProject.file('../signing/cma-dev.p12')\n            storeType 'pkcs12'\n            storePassword 'android'\n            keyAlias 'androiddebugkey'\n            keyPassword 'android'\n        }\n    }\n`;
if(!gradle.includes('// CMA DEVELOPMENT SIGNING')){if(!/android\s*\{/.test(gradle))throw Error('Android Gradle block was not found.');gradle=gradle.replace(/android\s*\{/,'android {\n'+signing)}
const number=Number(process.env.CMA_BUILD_NUMBER||process.env.GITHUB_RUN_NUMBER||1);if(!Number.isInteger(number)||number<1||number>2000000000)throw Error('Invalid build number.');
if(!/versionCode\s+\d+/.test(gradle)||!/versionName\s+"[^"]+"/.test(gradle))throw Error('Android version fields were not found.');
gradle=gradle.replace(/versionCode\s+\d+/,'versionCode '+(202000+number)).replace(/versionName\s+"[^"]+"/,'versionName "2.0.2.'+number+'"');fs.writeFileSync(gradlePath,gradle);
console.log('Purple CMA launcher icon, development signing and Android version configured.');
