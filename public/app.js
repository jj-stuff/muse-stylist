import {catalog} from './catalog.js';
const $=s=>document.querySelector(s);
const state={profile:{},wardrobe:[],history:[],occasion:'',weather:'',temperature:0,step:'',pending:[],busy:false,mode:'sample',googleClientId:null,result:null};
const colors={ivory:'#e8dfce',white:'#f2f0eb',blue:'#738697',navy:'#2f3a4f',oatmeal:'#c8b99e',black:'#393633',grey:'#9a9a9e',brown:'#866954',olive:'#7f846a',green:'#6f7f5a',taupe:'#ae9c86',red:'#a5453c',pink:'#d9a7a7'};
const colorWords=[[/white|cream/,'white'],[/ivory/,'ivory'],[/navy/,'navy'],[/blue|denim|jean/,'blue'],[/black/,'black'],[/gr[ae]y|charcoal/,'grey'],[/brown|chocolate|tan|camel/,'brown'],[/olive|khaki/,'olive'],[/green/,'green'],[/beige|taupe|stone/,'taupe'],[/oat/,'oatmeal'],[/red|burgundy/,'red'],[/pink/,'pink']];
const types=['top','bottom','shoes','layer','dress','accessory'];
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const smooth=()=>matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth';
const scrollDown=()=>$('#thread').scrollTo({top:$('#thread').scrollHeight,behavior:smooth()});
const occasions={'Class, then a date':'I have class this morning and a date tonight.','Weekend wandering':'A relaxed weekend coffee and a long walk.','Office to dinner':'A creative office meeting and dinner with friends.'};
const examples=[{style:'Minimal',title:'Clean and simple',items:['tee','trousers','sneakers']},{style:'Classic',title:'Sharp and classic',items:['shirt','trousers','loafers','blazer']},{style:'Expressive',title:'Warm and bold',items:['knit','skirt','loafers','jacket']}];
const demoEvents=['Lecture at 10:00 AM','Dinner date at 7:30 PM'];
const steps={
 closet:{options:()=>['Add photos','Pick from brands',state.wardrobe.length?'Done':'Skip for now'],free:true},
 style:{options:['1','2','3','More casual'],set:v=>state.profile.style=v==='More casual'?'Casual':examples[v-1].style},
 budget:{ask:'If you bought one new piece, what would you spend?',options:['Up to $50','Up to $100','Up to $200'],set:v=>state.profile.budget=v.match(/\d+/)[0]},
 comfort:{ask:'How do you like to feel in your clothes?',options:['Comfort first','A little polished','Ready to experiment'],set:v=>state.profile.comfort=v},
 weather:{ask:'What’s it like outside?',options:['Sunny, 24°','Cloudy, 18°','Rainy, 12°'],free:true},
 calendar:{ask:'Want me to check your calendar for today?',options:()=>[...state.googleClientId?['Check my calendar']:[],'Use a demo calendar','Skip']},
 agenda:{options:['Style me'],free:true},
 plans:{ask:'What are your plans today?',options:Object.keys(occasions),free:true},
 refine:{options:['Wear 1','Wear 2','Wear 3','Less formal','My black sneakers','Something warmer','New plans'],free:true}
};
const next={style:'budget',budget:'comfort'};
const optionsFor=s=>{const o=steps[s]?.options;return typeof o==='function'?o():o||[];};

function bubble(content,user=false,cls=''){const el=document.createElement('div');el.className=`msg ${user?'me':'muse'} ${cls}`;if(typeof content==='string')el.textContent=content;else el.append(content);$('#thread').append(el);scrollDown();return el;}
const say=t=>bubble(t);
function typing(){const el=bubble(Object.assign(document.createElement('span'),{className:'dots',innerHTML:'<i></i><i></i><i></i>'}),false,'typing');el.setAttribute('aria-label','Muse is typing');return el;}
function ask(step){state.step=step;if(steps[step].ask)say(steps[step].ask);chips();}
function chips(){
 const opts=state.busy?[]:state.pending.length?types.map(t=>t[0].toUpperCase()+t.slice(1)):optionsFor(state.step);
 $('#chips').replaceChildren(...opts.map(o=>{const b=document.createElement('button');b.type='button';b.className='chip';b.textContent=o;b.onclick=()=>handle(o);return b;}));
}
const match=(t,opts)=>opts.find(o=>o.toLowerCase()===t.toLowerCase())||t.length>=3&&opts.find(o=>o.toLowerCase().includes(t.toLowerCase())||t.toLowerCase().includes(o.toLowerCase()));
const guessType=t=>types.find(x=>t.toLowerCase().includes(x))||[[/shirt|tee|blouse|sweater|knit|hoodie|tank|polo/,'top'],[/jean|pant|trouser|skirt|short|legging|chino/,'bottom'],[/shoe|sneaker|boot|loafer|sandal|heel|trainer/,'shoes'],[/jacket|coat|blazer|cardigan|parka/,'layer'],[/bag|hat|cap|scarf|belt|watch/,'accessory']].find(([r])=>r.test(t.toLowerCase()))?.[1];
const guessColor=t=>colorWords.find(([r])=>r.test(t.toLowerCase()))?.[1];
const join=a=>a.length>1?a.slice(0,-1).join(', ')+' and '+a.at(-1):a[0];

function startStyle(){say('Which of these feels most like you?');looks(examples);state.step='style';chips();}
function addTyped(text){
 const added=[];
 for(const part of text.split(/,|\band\b|\n|;/).map(p=>p.trim()).filter(Boolean)){
  const type=guessType(part);if(!type)continue;
  if(state.wardrobe.length>=12){say('Your closet holds 12 pieces.');break;}
  state.wardrobe.push({id:crypto.randomUUID(),name:part[0].toUpperCase()+part.slice(1,100),type,color:guessColor(part)});added.push(part);
 }
 renderCloset();
 say(added.length?`Added ${join(added)}. Anything else?`:'Tell me what you own, like “black jeans, white tee, grey hoodie”.');chips();
}

function handle(text){
 text=text.trim();if(!text||state.busy)return;
 if(state.step==='closet'&&!state.pending.length){if(text==='Add photos')return $('#upload').click();if(text==='Pick from brands')return $('#closet').showModal();}
 bubble(text,true);
 if(state.pending.length){
  const item=state.wardrobe.find(i=>i.id===state.pending.shift());const type=guessType(text);
  if(!type){state.pending.unshift(item.id);say('Is it a top, bottom, shoes, a layer, a dress or an accessory?');return chips();}
  item.type=type;item.name=types.includes(text.toLowerCase())?`My ${type}`:text.slice(0,100);renderCloset();
  say(state.pending.length?'Got it. And the next one?':`${item.name} is in your closet.`);
  if(!state.pending.length&&steps[state.step]?.ask&&state.step!=='refine')say(steps[state.step].ask);
  return chips();
 }
 const s=state.step;
 if(s==='closet')return text==='Done'||text==='Skip for now'?startStyle():addTyped(text);
 if(s==='plans'){state.occasion=occasions[text]||text;return request();}
 if(s==='agenda'){if(text!=='Style me')state.occasion=`${state.occasion}. ${text}`.slice(0,1500);return request();}
 if(s==='calendar')return text==='Skip'?ask('plans'):text==='Use a demo calendar'?useEvents(demoEvents):readCalendar();
 if(s==='weather'){
  const w=text.match(/sun|cloud|rain/i)?.[0].toLowerCase(),n=text.match(/-?\d+/)?.[0];
  if(!w&&!n)return say('Sunny, cloudy or rainy? Add the temperature in °C if you know it.');
  state.weather={sun:'Sunny',cloud:'Cloudy',rain:'Rainy'}[w]||'Cloudy';state.temperature=n?Math.max(-30,Math.min(50,Number(n))):{Sunny:24,Cloudy:18,Rainy:12}[state.weather];
  return ask('calendar');
 }
 if(s==='refine'){
  const wear=text.match(/^wear (\d)$/i);
  if(wear){const o=state.result.outfits[wear[1]-1];if(o)say(`Good pick. ${o.title} it is. Have a great day.`);return;}
  if(text==='New plans'){state.history=[];return ask('plans');}
  return request(text);
 }
 const v=match(text,optionsFor(s));
 if(!v)return say('Pick one of the options below.');
 steps[s].set(v);
 if(s==='comfort')return checkWeather();
 ask(next[s]);
}

const tile=i=>i.data?`<img src="${i.data}" alt="">`:i.image?`<img src="assets/${i.image}" alt="" data-color="${colors[i.color]||''}">`:`<span class="tile" style="background:${colors[i.color]||'#dacbbc'}"></span>`;
const fallback=root=>root.querySelectorAll('img[data-color]').forEach(img=>img.onerror=()=>img.replaceWith(Object.assign(document.createElement('span'),{className:'tile',style:`background:${img.dataset.color||'#dacbbc'}`})));
function looks(list,{save}={}){
 const inventory=[...state.wardrobe,...catalog],wrap=document.createElement('div');wrap.className='looks';
 wrap.innerHTML=list.map((o,n)=>{const items=o.items.map(id=>inventory.find(i=>i.id===id));return `<article class="look"><div class="pics">${items.slice(0,4).map(tile).join('')}</div><h2><span class="num">${n+1}</span>${escape(o.title)}</h2><ul>${items.map(i=>`<li>${escape(i.name)}${i.brand?` <span class="price">${escape(i.brand)} · $${i.price}</span>`:''}</li>`).join('')}</ul>${o.explanation?`<p>${escape(o.explanation)}</p><p>${escape(o.tip)}</p>`:''}${save?`<button class="link strong" data-save="${n}">Save look</button>`:''}</article>`;}).join('');
 fallback(wrap);
 wrap.querySelectorAll('[data-save]').forEach(el=>el.onclick=()=>{const o=list[Number(el.dataset.save)];const text=`MUSE — ${o.title}\n\n${o.items.map(id=>inventory.find(i=>i.id===id).name).join('\n')}\n\n${o.explanation}\n\n${o.tip}\n\n${state.result.mode==='sample'?'Sample recommendation':'Generated with Gemini'}`;const url=URL.createObjectURL(new Blob([text],{type:'text/plain'}));const a=document.createElement('a');a.href=url;a.download='muse-outfit.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
 $('#thread').append(wrap);scrollDown();
}

async function checkWeather(){
 state.step='';state.busy=true;chips();say('Let me check the weather where you are.');const t=typing();
 try{
  const {coords}=await new Promise((ok,no)=>navigator.geolocation?navigator.geolocation.getCurrentPosition(ok,no,{timeout:10000,maximumAge:600000}):no());
  const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude.toFixed(2)}&longitude=${coords.longitude.toFixed(2)}&current=temperature_2m,weather_code`);if(!r.ok)throw 0;
  const {current}=await r.json();const code=current.weather_code;
  state.weather=code>=51?'Rainy':code>=2?'Cloudy':'Sunny';state.temperature=Math.round(current.temperature_2m);
  t.remove();say(`It’s ${state.temperature}° and ${code>=71&&code<=86?'snowy':state.weather.toLowerCase()} outside.`);
  state.busy=false;ask('calendar');
 }catch{t.remove();say('I couldn’t get the weather, so tell me.');state.busy=false;ask('weather');}
}

function useEvents(events){
 if(!events.length){say('Your calendar is clear today.');return ask('plans');}
 state.occasion=`Today: ${events.join('; ')}`.slice(0,1500);
 say(`Today you have ${join(events)}.`);
 if(state.mode==='gemini')say('I’ll send these event names to Gemini when I style you.');
 say('Anything else I should know? Or I’ll style you for that.');state.step='agenda';chips();
}
let calendarScript;
const loadCalendar=()=>calendarScript??=new Promise((ok,no)=>document.head.append(Object.assign(document.createElement('script'),{src:'https://accounts.google.com/gsi/client',onload:ok,onerror:no})));
async function readCalendar(){
 state.busy=true;chips();
 try{
  await loadCalendar();
  const token=await new Promise((ok,no)=>google.accounts.oauth2.initTokenClient({client_id:state.googleClientId,scope:'https://www.googleapis.com/auth/calendar.events.readonly',callback:r=>r.error?no(r):ok(r.access_token),error_callback:no}).requestAccessToken());
  const start=new Date();start.setHours(0,0,0,0);const end=new Date(start);end.setDate(end.getDate()+1);
  const r=await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&maxResults=10&timeMin=${start.toISOString()}&timeMax=${end.toISOString()}`,{headers:{Authorization:`Bearer ${token}`}});if(!r.ok)throw 0;
  google.accounts.oauth2.revoke(token);
  const events=(await r.json()).items.filter(e=>e.summary&&e.status!=='cancelled').map(e=>`${e.summary.slice(0,120)} ${e.start.dateTime?'at '+new Date(e.start.dateTime).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}):'all day'}`);
  state.busy=false;useEvents(events);
 }catch{state.busy=false;say('I couldn’t open your calendar.');ask('calendar');}
}

async function request(refinement=''){
 const input={profile:state.profile,wardrobe:state.wardrobe,occasion:state.occasion,weather:state.weather,temperature:state.temperature,history:state.history,refinement};
 state.busy=true;chips();const t=typing();
 try{
  const response=await fetch('api/style',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)});const result=await response.json();
  if(!response.ok)throw new Error(result.error||'I couldn’t style that one. Try again?');
  t.remove();state.result=result;say(result.message);looks(result.outfits,{save:true});
  if(result.addition){const a=catalog.find(i=>i.id===result.addition);say(`If you want something new, ${a.brand} makes a good ${a.name.toLowerCase()}, about $${a.price}.`);}
  if(refinement){state.history.push(refinement);state.history=state.history.slice(-8);}
  say('Which one are you wearing? Or tell me what to change.');state.step='refine';
 }catch(err){t.remove();bubble(err.message||'I can’t reach the server. Check your connection and try again.',false,'error').setAttribute('role','alert');}
 finally{state.busy=false;chips();scrollDown();}
}

$('#text').oninput=e=>$('.send').disabled=!e.target.value.trim();
$('#composer').onsubmit=e=>{e.preventDefault();const t=$('#text').value;$('#text').value='';$('.send').disabled=true;handle(t);};

function renderCloset(){
 $('#closet-count').textContent=state.wardrobe.length?` ${state.wardrobe.length}`:'';
 $('#pieces').innerHTML=state.wardrobe.length?state.wardrobe.map(i=>`<li class="piece">${tile(i)}<label class="sr-only" for="name-${i.id}">Name</label><input id="name-${i.id}" data-name="${i.id}" value="${escape(i.name)}" maxlength="100"><label class="sr-only" for="type-${i.id}">Category</label><select id="type-${i.id}" data-type="${i.id}">${types.map(t=>`<option value="${t}" ${i.type===t?'selected':''}>${t[0].toUpperCase()+t.slice(1)}</option>`).join('')}</select><button class="link danger" data-remove="${i.id}" aria-label="Remove ${escape(i.name)}">Remove</button></li>`).join(''):'<li class="empty">Nothing here yet. Add photos, or pick pieces from brands I know below.</li>';
 $('#pieces').querySelectorAll('[data-name]').forEach(el=>el.onchange=()=>{state.wardrobe.find(i=>i.id===el.dataset.name).name=el.value.trim()||'My clothing';});
 $('#pieces').querySelectorAll('[data-type]').forEach(el=>el.onchange=()=>{state.wardrobe.find(i=>i.id===el.dataset.type).type=el.value;});
 $('#pieces').querySelectorAll('[data-remove]').forEach(el=>el.onclick=()=>{state.wardrobe=state.wardrobe.filter(i=>i.id!==el.dataset.remove);state.pending=state.pending.filter(id=>id!==el.dataset.remove);renderCloset();chips();});
 $('#samples').innerHTML=catalog.map(i=>{const added=state.wardrobe.some(w=>w.id===i.id);return `<li>${tile(i)}<span>${i.name}<br><span class="price">${escape(i.brand)} · $${i.price}</span></span><button class="link strong" data-add="${i.id}" ${added?'disabled':''}>${added?'Added':'Add'}</button></li>`;}).join('');
 $('#samples').querySelectorAll('[data-add]').forEach(el=>el.onclick=()=>{if(state.wardrobe.length>=12)return alert('Your closet holds 12 pieces. Remove one first.');state.wardrobe.push({...catalog.find(i=>i.id===el.dataset.add)});renderCloset();chips();});
 fallback($('#closet'));
}
async function resize(file){
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024)throw new Error('That photo didn’t work. Use a JPEG, PNG or WebP under 10 MB.');
 const bitmap=await createImageBitmap(file);const canvas=document.createElement('canvas');const ratio=Math.min(1,1000/Math.max(bitmap.width,bitmap.height));canvas.width=Math.round(bitmap.width*ratio);canvas.height=Math.round(bitmap.height*ratio);const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();return canvas.toDataURL('image/jpeg',.78);
}
async function upload(e,inChat){
 const files=[...e.target.files];e.target.value='';let added=0;
 for(const file of files){
  if(state.wardrobe.length>=12){(inChat?say:alert)('Your closet holds 12 pieces. Remove one to add another.');break;}
  try{const data=await resize(file);const id=crypto.randomUUID();state.wardrobe.push({id,name:'My clothing',type:'top',data});added++;if(inChat){state.pending.push(id);bubble(Object.assign(new Image(),{src:data,alt:'Your clothing photo'}),true,'photo');}}
  catch(err){(inChat?say:alert)(err.message||'That photo didn’t work. Try another one.');}
 }
 renderCloset();
 if(inChat&&added){say(added>1?'Nice. What are these? Start with the first one.':'Nice. What is it?');if(state.mode==='gemini')say('When I style your day, I send your photos to Gemini to look at them. Muse doesn’t keep them.');}
 chips();
}
$('#upload').onchange=e=>upload(e,true);
$('#closet-upload').onchange=e=>upload(e,false);
$('#open-closet').onclick=()=>$('#closet').showModal();
$('#close-closet').onclick=()=>$('#closet').close();
$('#closet').onclick=e=>{if(e.target===$('#closet'))$('#closet').close();};
$('#closet').onclose=()=>{if(state.step==='closet'&&state.wardrobe.length){say(`Your closet has ${state.wardrobe.length} piece${state.wardrobe.length>1?'s':''}. Add more, or tap Done.`);chips();}};

renderCloset();
say('Hi, I’m Muse. I’ll put three outfits together for your day.');
say('First, show me what you own. Add photos, pick pieces from brands I know, or just type them, like “black jeans, white tee”.');
state.step='closet';chips();
fetch('api/status').then(r=>r.json()).then(s=>{state.mode=s.mode;state.googleClientId=s.googleClientId;if(s.googleClientId)loadCalendar().catch(()=>{});chips();}).catch(()=>bubble('I can’t reach the styling server. Start the app with npm start.',false,'error'));
