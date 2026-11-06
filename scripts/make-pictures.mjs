// One-off: generates the catalog's flat-lay pictures with Gemini's image model into public/assets/.
// Run: node --env-file=.env scripts/make-pictures.mjs  (macOS: uses sips to save small JPEGs). Skips files that exist.
import {writeFile,access,unlink} from 'node:fs/promises';import {execFileSync} from 'node:child_process';
import {catalog} from '../public/catalog.js';
const key=process.env.GEMINI_API_KEY,model=process.env.GEMINI_IMAGE_MODEL||'gemini-2.5-flash-image';
if(!key)throw new Error('Set GEMINI_API_KEY in .env first.');
for(const item of catalog){
 const out=`public/assets/${item.image}`;if(await access(out).then(()=>true,()=>false)){console.log('skip',out);continue;}
 const prompt=`Square studio flat-lay product photograph of a single ${item.name.toLowerCase()} (${item.type}), neatly laid out and centered, on a plain light warm-grey background, soft even daylight, gentle natural shadow. No logos, no text, no people, no props.`;
 const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify({contents:[{parts:[{text:prompt}]}]})});
 if(!r.ok)throw new Error(`${item.id}: ${r.status} ${await r.text()}`);
 const part=(await r.json()).candidates?.[0]?.content?.parts?.find(p=>p.inlineData);if(!part)throw new Error(`${item.id}: no image returned`);
 const tmp=`${out}.src`;await writeFile(tmp,Buffer.from(part.inlineData.data,'base64'));
 execFileSync('sips',['-s','format','jpeg','-s','formatOptions','78','-Z','640',tmp,'--out',out],{stdio:'ignore'});await unlink(tmp);
 console.log('made',out);
}
