import { build } from 'esbuild';
await build({entryPoints:['scripts/native-entry.mjs'],bundle:true,format:'iife',target:['chrome105'],outfile:'www/native.js',minify:true,legalComments:'eof'});
console.log('Native file sharing and Android lifecycle bridge bundled.');
