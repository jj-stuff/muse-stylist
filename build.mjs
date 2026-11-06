import {mkdir,readFile,readdir,writeFile} from 'node:fs/promises';
import {extname} from 'node:path';
await mkdir('dist/server',{recursive:true});
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.jpg':'image/jpeg'};const assets={};
async function collect(dir,prefix=''){for(const entry of await readdir(dir,{withFileTypes:true})){const path=`${dir}/${entry.name}`;const key=`${prefix}/${entry.name}`;if(entry.isDirectory())await collect(path,key);else assets[key]={type:types[extname(path)]||'application/octet-stream',data:(await readFile(path)).toString('base64')};}}
await collect('public');
const catalog=(await readFile('public/catalog.js','utf8')).replace('export const','const');
const stylist=(await readFile('stylist.mjs','utf8')).replace(/import .*?;\n/,'').replaceAll('export function','function').replaceAll('export async function','async function');
const handler=(await readFile('handler.mjs','utf8')).replace(/import .*?;\n/,'').replace('export async function','async function');
await writeFile('dist/server/index.js',`${catalog}\n${stylist}\n${handler}\nconst assets=${JSON.stringify(assets)};\nexport default {async fetch(request,env){const path=new URL(request.url).pathname;if(path.startsWith('/api/'))return handleApi(request,env);const asset=assets[path==='/'?'/index.html':path];if(!asset)return new Response('Not found',{status:404});return new Response(Uint8Array.from(atob(asset.data),c=>c.charCodeAt(0)),{headers:{'Content-Type':asset.type,'X-Content-Type-Options':'nosniff'}});}};`);
console.log('Built dist/server/index.js');
