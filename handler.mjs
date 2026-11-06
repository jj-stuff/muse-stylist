import {generateOutfits} from './stylist.mjs';
export async function handleApi(request,env={}){
 const path=new URL(request.url).pathname;
 const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 if(path==='/api/status'&&request.method==='GET')return json({mode:env.GEMINI_API_KEY?'gemini':'sample'});
 if(path!=='/api/style')return json({error:'Not found'},404);
 if(request.method!=='POST')return json({error:'Use POST'},405);
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return json({error:'Cross-origin requests are not allowed.'},403);
 try{
  if(Number(request.headers.get('content-length')||0)>20000000)return json({error:'The photos are too large.'},413);
  const reader=request.body?.getReader();if(!reader)return json({error:'Request body is required.'},400);
  const chunks=[];let size=0;while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>20000000){await reader.cancel();return json({error:'The photos are too large.'},413);}chunks.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  const input=JSON.parse(new TextDecoder().decode(bytes));return json(await generateOutfits(input,env));
 }catch(error){return json({error:error instanceof SyntaxError?'The request is not valid JSON.':error.name==='TimeoutError'?'Gemini took too long. Try again.':error.message||'Unable to create outfits.'},400);}
}
