/* Reglas transparentes; las semejanzas y la coherencia requieren revisión humana. */
const Editorial=(()=>{
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
 const stop=new Set('para como sobre entre hasta desde tras ante este esta estos estas una unas unos del las los por con sin que the and for with from after into near report news noticia noticias puede fueron hay mas sus son han'.split(' '));
 const words=s=>[...new Set(norm(s).split(' ').filter(w=>w.length>3&&!stop.has(w)))];
 function overlap(a,b){const aa=words(a),bb=new Set(words(b));return aa.filter(x=>bb.has(x)).length/Math.max(1,aa.length);}
 function clean(s){let text=String(s||'').replace(/\r/g,'');
  if(typeof DOMParser!=='undefined'&&/<[a-z][\s\S]*>/i.test(text)){const d=new DOMParser().parseFromString(text,'text/html');d.querySelectorAll('script,style,nav,aside,footer').forEach(n=>n.remove());d.querySelectorAll('p,div,br,li,h1,h2,h3').forEach(n=>n.append('\n'));text=d.body.textContent||'';}
  text=text.replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&');
  const marker=/(?:^|\n|(?<=[.!?])\s+)(?:lea(?:se)? tambi[eé]n|leer tambi[eé]n|te puede interesar|noticias relacionadas|art[ií]culos relacionados|read also|also read|related (?:news|articles|stories)|you may also like|leia tamb[eé]m)\s*[:\n]/im;
  const m=marker.exec(text),removed=!!m;
  return {text:(m?text.slice(0,m.index):text).replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim(),removed};
 }
 function summarize(title,body){const c=clean(body);const parts=c.text.split(/\n\s*\n|\n|(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ])/).filter(x=>x.trim().length>30);
  const matching=parts.map((p,i)=>({p,i,score:overlap(title,p)})).filter(x=>x.score>=.18&&words(title).filter(w=>norm(x.p).split(' ').includes(w)).length>=2);
  const best=Math.max(0,...matching.map(x=>x.score));return matching.filter(x=>x.score>=Math.max(.18,best-.15)).slice(0,3).map(x=>x.p.trim()).join(' ').slice(0,1500);
 }
 function freshness(value,now=Date.now()){const s=String(value||'').trim();if(!s)return {state:'unknown',label:'Sin fecha de publicación'};
  if(!/\d{1,2}:\d{2}/.test(s))return {state:'unknown',label:'Fecha sin hora: verificar 24 h'};
  let iso=s;const d=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})[ T](.*)$/);if(d)iso=`${d[3]}-${d[2].padStart(2,'0')}-${d[1].padStart(2,'0')}T${d[4]}`;
  if(!/(Z|[+-]\d{2}:?\d{2}|GMT|UTC)$/i.test(iso))return {state:'unknown',label:'Falta zona horaria de publicación'};
  const parts=iso.match(/^(\d{4})-(\d{2})-(\d{2})/);if(parts){const check=new Date(Date.UTC(+parts[1],+parts[2]-1,+parts[3]));if(check.getUTCFullYear()!==+parts[1]||check.getUTCMonth()!==+parts[2]-1||check.getUTCDate()!==+parts[3])return {state:'unknown',label:'Fecha de publicación no válida'};}
  const t=Date.parse(iso);if(!Number.isFinite(t))return {state:'unknown',label:'Fecha de publicación no válida'};
  const age=now-t;if(age<0)return {state:'future',label:'Fecha futura: verificar'};
  if(age>86400000)return {state:'old',label:'Fuera de las últimas 24 horas'};
  return {state:'recent',label:`Publicada hace ${(age/3600000).toFixed(1)} h`};
 }
 function special(title){if(/\bel nino\b/.test(norm(title))&&!/(fenomeno|clima|sequ|lluv|temperatur|pacific|calent|inund|pronostic|riesgo|meteorolog|enso)/.test(norm(title)))return /\b(?:incendios?|wildfires?|forest fires?|fire|fires|queimadas)\b/.test(norm(title));return /\b(?:fenomeno (?:de |del )?el nino|fenomeno del nino|el nino|enso|incendios?|wildfires?|forest fires?|fire|fires|queimadas|incendio florestal)\b/.test(norm(title));}
 function section(r,title){const s=r.scope;const geo=s==='Nacional'?'Nacionales':s==='Internacional'?'Internacionales':'Ámbito por verificar';return {key:(special(title)?'0':'1')+({'Nacionales':'0','Internacionales':'1','Ámbito por verificar':'2'}[geo]),label:(special(title)?'El Niño e incendios · ':'')+geo};}
 function compare(title,text){const cleanTitle=norm(title),n=words(title).length;if(n<3)return {score:0,exact:false,snippet:''};
  const sentences=String(text||'').split(/\n+/).filter(x=>x.trim());let best={score:0,exact:false,snippet:''};
  for(let i=0;i<sentences.length;i++){for(let width=1;width<=3;width++){const snippet=sentences.slice(i,i+width).join(' '),normal=norm(snippet);const exact=cleanTitle.length>=25&&normal.includes(cleanTitle),score=exact?1:overlap(title,snippet);if(score>best.score)best={score,exact,snippet:snippet.slice(0,600)};}}
  return best;
 }
 return {norm,words,overlap,clean,summarize,freshness,special,section,compare};
})();
if(typeof module!=='undefined')module.exports=Editorial;
