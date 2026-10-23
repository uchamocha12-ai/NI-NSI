'use strict';
const $=id=>document.getElementById(id);
const text=v=>String(v??'').trim();
const norm=v=>text(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
const key=v=>norm(v).replace(/[^A-Z0-9]/g,'');
const code=v=>text(v).replace(/\.0+$/,'').replace(/^0+(?=\d)/,'');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const known={'200':'Cólera','205':'Chagas','275':'Encefalitis equina del este en humanos','307':'Vigilancia integrada de rabia humana','310':'Fiebre amarilla','348':'IRAG inusitada','570':'Mortalidad por cólera','670':'Rabia humana','710':'Rubéola','730':'Sarampión','800':'Tos ferina'};
const countryCodes=new Set('004 008 010 012 016 020 024 028 031 032 036 040 044 048 050 051 052 056 060 064 068 070 072 074 076 084 086 090 092 096 100 104 108 112 116 120 124 132 136 140 144 148 152 156 158 162 166 170 174 175 178 180 184 188 191 192 196 203 204 208 212 214 218 222 226 231 232 233 234 238 239 242 246 248 250 254 258 260 262 266 268 270 275 276 288 292 296 300 304 308 312 316 320 324 328 332 334 336 340 344 348 352 356 360 364 368 372 376 380 384 388 392 398 400 404 408 410 414 417 418 422 426 428 430 434 438 440 442 446 450 454 458 462 466 470 474 478 480 484 492 496 498 499 500 504 508 512 516 520 524 528 531 533 534 535 540 548 554 558 562 566 570 574 578 580 581 583 584 585 586 591 598 600 604 608 612 616 620 624 626 630 634 638 642 643 646 652 654 659 660 662 663 666 670 674 678 682 686 688 690 694 702 703 704 705 706 710 716 724 728 729 732 740 744 748 752 756 760 762 764 768 772 776 780 784 788 792 795 796 798 800 804 807 818 826 831 832 833 834 840 850 854 858 860 862 876 882 887 894'.split(' ').map(Number));
const missing=new Set(['','0','999','9999','99999','-','--','NA','N/A','#N/D','#N/A','SIN INFORMACION','SIN DATO','SIN DATOS','DESCONOCIDO','NO DEFINIDO','NO APLICA','NULL','NONE']);
function field(row,aliases){for(const [h,c] of row.cells)if(aliases.includes(key(h)))return c.v;return '';}
const SPECIAL_EVENTS={"200": "COLERA", "205": "CHAGAS", "230": "DIFTERIA", "250": "ENCEFALITIS DEL NILO OCCIDENTAL EN HUMANOS", "270": "ENCEFALITIS EQUINA DEL OESTE EN HUMANOS", "290": "ENCEFALITIS EQUINA VENEZOLANA EN HUMANOS", "295": "ENFERMEDADES DE ORIGEN PRIONICO", "310": "FIEBRE AMARILLA", "348": "INFECCION RESPIRATORIA AGUDA GRAVE IRAG INUSITADA", "350": "ENFERMEDADES TRANSMITIDAS POR ALIMENTOS O AGUA ETA (BROTES)", "360": "INTOXICACION POR PLAGUICIDAS", "380": "INTOXICACION POR METANOL", "390": "INTOXICACION POR METALES PESADOS", "400": "INTOXICACION POR SOLVENTES", "410": "INTOXICACION POR OTRAS SUSTANCIAS QUIMICAS", "412": "INTOXICACION POR GASES", "440": "LEISHMANIASIS VISCERAL", "500": "MENINGITIS  MENINGOCOCCICA", "570": "MORTALIDAD POR COLERA", "610": "PARALISIS FLACIDA AGUDA (MENORES DE 15 AÑOS)", "670": "RABIA HUMANA", "710": "RUBEOLA", "720": "SINDROME DE RUBEOLA CONGENITA", "730": "SARAMPION", "770": "TETANOS NEONATAL", "452": "LESIONES POR ARTEFACTOS EXPLOSIVOS (POLVORA Y MINAS ANTIPERSONAL)", "535": "MENINGITIS BACTERIANA Y ENFERMEDAD MENINGOCÓCICA", "307": "VIGILANCIA INTEGRADA DE RABIA HUMANA", "365": "INTOXICACIONES", "607": "EBOLA", "725": "SÍNDROME NEUROLÓGICO PROBABLEMENTE ASOCIADO A VIRUS ZIKA", "275": "ENCEFALITIS EQUINA DEL ESTE EN HUMANOS", "349": "BROTES DE ENFERMEDADES TRANSMITIDAS POR ALIMENTOS Y VEHICULIZADAS POR AGUA, HEPATITIS A, FIEBRE TIFOIDE/PARATIFOIDEA, CÓLERA", "739": "SÍNDROME INFLAMATORIO MULTISISTÉMICO EN NIÑOS ASOCIADO A SARS-COV2", "355": "ENFERMEDAD TRANSMITIDA POR ALIMENTOS O AGUA (ETA)", "800": "TOS FERINA "};
function alertFor(row){
 const vals=aliases=>[...row.cells].filter(([h])=>aliases.includes(key(h).replace(/^\d+/,''))).map(([,c])=>c.v);
 const val=aliases=>vals(aliases).find(v=>!missing.has(norm(v)))??'';
 const yes=v=>v===true||/^(1(?:\.0+)?|SI|S|TRUE|X|SI[ .:-].*)$/.test(norm(v));
 const pop=[],ev=[],review=[];
 const add=(s)=>{if(!pop.includes(s))pop.push(s)};
 const et=norm(val(['PERETN','PERTENENCIAETNICA']));
 const indigenous=/^1(?:\.0+)?$/.test(et)||/^1\s*[-.:]\s*INDIGENA/.test(et)||/^INDIGENAS?$/.test(et);
 if(indigenous)add('Indígena · pertenencia étnica');
 const groups=norm(vals(['GRUPOSPOBLACIONALES','GRUPOPOBLACIONAL','GRUPOSPOBLACIONALESALOSQUEPERTENECEELPACIENTE']).join(' | '));
 if(vals(['GPCARCEL','GPCARCELA','PPL','PERSONASPRIVADASDELALIBERTAD','POBLACIONPRIVADADELALIBERTAD','CARCELARIOS']).some(yes)||/PRIVAD[AO]S? DE (LA )?LIBERTAD|CARCELARI|\bPPL\b/.test(groups))add('PPL · grupo poblacional');
 if(vals(['GPICBF','GPPOBICBF','GPINFANT','GPINFANTIL','POBLACIONINFANTIL','POBLACIONINFANTILACARGODELICBF']).some(yes)||/INFANTIL|ICBF/.test(groups))add('Población infantil · grupo poblacional/ICBF');
 if(vals(['GPMIGRANT','GPMIGRANTE','GPMIGRANTES','MIGRANTES']).some(yes)||/MIGRANTE/.test(groups))add('Migrante · grupo poblacional');
 const upgd=String(val(['UPGD','CODPRE','CODUPGD','CODIGOUPGD','CODIGODELAUPGD'])).trim().replace(/\.0+$/,'').replace(/[ -]/g,'');
 const sub=String(val(['CODSUB','CODSUBINDICE','CODSUBIND','SUBINDICE','SUBIND','SUBINDUPGD','SUBINDICEUPGD'])).replace(/\.0+$/,'');
 if(sub==='99'||(/^\d{12}$/.test(upgd)&&upgd.endsWith('99')))add('PPL · subíndice UPGD 99');
 const admin=norm(val(['CODASE','CODEAPB','EAPB','ADMINISTRADORA','CODIGOADMINISTRADORA','NOMASE','NOMEAPB','NOMBREDELAADMINISTRADORADEPLANESDEBENEFICIOS']));
 const occupation=norm(val(['OCUPACION','OCUPACIONDELPACIENTE','NOCUPACION','NOMOCUPACION','OCUPAC']));
 const institution=norm(val(['NUNIMODIF','NOMUPGD','NOMBREUPGD','RAZONSOCIAL','RAZONSOCIALDELAUNIDADPRIMARIAGENERADORADELDATO']));
 if(/RES001|POLICIA|POLICIAL/.test(admin))add('Policía · administradora (vinculación por verificar)');
 if(/RES003|FUERZAS MILITARES|SANIDAD MILITAR/.test(admin))add('Fuerzas Militares · administradora (vinculación por verificar)');
 if(/\b(MILITAR|MILITARES|SOLDADO|POLICIA|POLICIAS|MARINO|INFANTE DE MARINA)\b|EJERCITO|ARMADA|FUERZA AEREA|FUERZA AEROESPACIAL/.test(occupation))add('Fuerza Pública · ocupación: '+occupation);
 if(/^\d{10}(\d{2})?$/.test(upgd)&&['7','8'].includes(upgd[5]))add((upgd[5]==='7'?'Policía':'Fuerzas Militares')+' · UPGD (vinculación por verificar)');
 if(/MILITAR|POLICIA|EJERCITO|ARMADA|NAVAL|FUERZA AEREA|FUERZA AEROESPACIAL/.test(institution))add('Posible Fuerza Pública · institución (verificar)');
 const regime=norm(val(['TIPSS','TIPOREGIMEN','REGIMEN','TIPODEREGIMENENSALUD']));
 if(/POLICIA|MILITAR/.test(regime))add('Fuerza Pública · régimen descrito (verificar)');
 else if(['P','E','EXCEPCION','ESPECIAL'].includes(regime)&&!pop.some(p=>/Fuerza|Policía/.test(p)))review.push('Régimen de excepción/especial: insuficiente para identificar Fuerza Pública');
 const cv=val(['CODPAISO','CODIGOPAISPROCEDENCIA']),nc=code(cv),pn=norm(val(['NPAISPROCE','PAISPROCEDENCIA','PAISOCURRENCIA']));
 const valid=/^\d+$/.test(nc)&&countryCodes.has(Number(nc));
 const cs=valid?(Number(nc)===170?'local':'foreign'):null;
 const ns=!missing.has(pn)&&/[A-Z]/.test(pn)?(['COLOMBIA','COL','CO','REPUBLICA DE COLOMBIA'].includes(pn)?'local':'foreign'):null;
 const conflict=cs&&ns&&cs!==ns;
 const invalid=!missing.has(norm(cv))&&!valid;
 const exterior=!conflict&&!invalid&&(cs==='foreign'||ns==='foreign');
 if(exterior)add('Procedencia del exterior · '+(pn||nc)+' (no determina nacionalidad)');
 if(conflict||invalid)review.push('Verificar país de procedencia: código/nombre inválido o contradictorio');
 const c=code(row.code),name=norm(row.name||val(['NOMEVE','NOMBREEVENTO','EVENTO']));
 const all={'275':'Encefalitis equina del este en humanos','200':'Cólera','570':'Mortalidad por cólera','230':'Difteria','607':'Ébola','670':'Rabia humana','307':'Vigilancia integrada de rabia humana'};
 if(all[c])ev.push(all[c]+' · todos los registros');

 const sar=c==='730'||name==='SARAMPION',tos=c==='800'||name==='TOS FERINA';
 const dn=norm(val(['NDEP NOT','NDEPNOT','DEPARTAMENTONOTIFICACION','DEPARTAMENTODENOTIFICACION','NOMBREDEPARTAMENTONOTIFICACION'].map(key)));
 const dc=code(val(['CODDPTO','CODDPTON','CODDEPNOT','DEPNOT','CODIGODEPARTAMENTONOTIFICACION']));
 const amazon=dc==='91'||dn==='AMAZONAS'||(/^\d{10}(\d{2})?$/.test(upgd)&&upgd.startsWith('91'));
 if(sar&&(exterior||amazon))ev.push('Sarampión · '+[exterior?'procedencia exterior':'',amazon?'notificado en Amazonas':''].filter(Boolean).join(' y '));
 if(sar&&!cs&&!ns)review.push('Sarampión: falta país de procedencia');
 if(sar&&!dc&&!dn&&!upgd)review.push('Sarampión: falta ubicación de notificación');
 if(tos&&indigenous)ev.push('Tos ferina · población indígena');
 if(tos&&!et)review.push('Tos ferina: falta pertenencia étnica');
 if(vals(['GPINDIGEN']).some(yes)&&!indigenous)review.push('Verificar gp_indigen frente a pertenencia étnica');
 const kind=pop.length&&ev.length?'both':pop.length?'population':ev.length?'critical':review.length?'verify':'normal';
 return {kind,label:({both:'POBLACIÓN + EVENTO',population:'POBLACIÓN ESPECIAL',critical:'CRITERIO DE EVENTO',verify:'VERIFICAR',normal:'SIN CRITERIO ESPECIAL'})[kind],
 reason:[pop.length?'Poblaciones: '+pop.join('; '):'',ev.length?'Evento: '+ev.join('; '):'',review.length?'Verificar: '+review.join('; '):''].filter(Boolean).join(' | ')||'Registro conservado; sin criterio especial identificado',populations:pop,eventCriteria:ev};
}

function isDateColumn(header){return /^(FEC|FECHA)/.test(key(header))||['INISIN','REGINIFEC'].includes(key(header));}
function textDate(value){
 const s=text(value);let y,m,d;
 let a=s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[ T].*)?$/);
 if(a){[,y,m,d]=a.map(Number);}else{
  a=s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:[ T].*)?$/);if(!a)return null;
  d=Number(a[1]);m=Number(a[2]);y=Number(a[3]);
  // Text dates default to day/month; infer month/day only when unambiguous.
  if(m>12&&d<=12)[d,m]=[m,d];
 }
 const date=new Date(Date.UTC(y,m-1,d));
 return date.getUTCFullYear()===y&&date.getUTCMonth()===m-1&&date.getUTCDate()===d?date:null;
}
function readCell(cell,date1904,header){
 if(!cell)return {v:null};
 if(cell.t==='e')return {v:cell.w||'#ERROR'};
 if(cell.t==='n'&&((cell.z&&XLSX.SSF.is_date(cell.z))||(isDateColumn(header)&&cell.v>0&&cell.v<2958466))){
  const d=XLSX.SSF.parse_date_code(cell.v,{date1904});
  if(d)return {v:new Date(Date.UTC(d.y,d.m-1,d.d,d.H,d.M,d.S)),date:true,z:'dd/mm/yyyy'};
 }
 if(typeof cell.v==='string'&&isDateColumn(header)){const d=textDate(cell.v);if(d)return {v:d,date:true,z:'dd/mm/yyyy'};}
 return {v:cell.v??null,z:cell.z};
}
function showCell(c){if(!c)return '';if(c.date){const d=c.v;return `${String(d.getUTCDate()).padStart(2,'0')}/${String(d.getUTCMonth()+1).padStart(2,'0')}/${d.getUTCFullYear()}`;}return text(c.v);}
function parseBook(bytes,source){
 const wb=bytes?.SheetNames?bytes:XLSX.read(bytes,{type:'array',cellDates:false,cellNF:true});
 const date1904=!!wb.Workbook?.WBProps?.date1904, rows=[],notes=[];
 for(const sn of wb.SheetNames){
  const ws=wb.Sheets[sn];if(!ws['!ref']){notes.push(`${source} / ${sn}: hoja vacía`);continue;}
  const range=XLSX.utils.decode_range(ws['!ref']);let hr=-1,ec=-1;
  if(range.e.c>2000||range.e.r>200000)throw Error(`${source}: hoja demasiado grande (máximo 200.000 filas y 2.000 columnas).`);
  for(let r=range.s.r;r<=Math.min(range.e.r,range.s.r+49)&&hr<0;r++)for(let c=range.s.c;c<=range.e.c;c++)if(['CODEVE','CODIGOEVENTO','CODIGODELEVENTO'].includes(key(ws[XLSX.utils.encode_cell({r,c})]?.v))){hr=r;ec=c;break;}
  if(hr<0){notes.push(`${source} / ${sn}: hoja sin columna cod_eve, omitida`);continue;}
  const headers=[],used=new Set();
  for(let c=range.s.c;c<=range.e.c;c++){
   let h=text(ws[XLSX.utils.encode_cell({r:hr,c})]?.v)||`Columna_${c+1}`,b=h,i=2;while(used.has(h))h=b+'_'+i++;
   headers.push(h);used.add(h);
  }
  for(let r=hr+1;r<=range.e.r;r++){
   const cells=new Map();let filled=false;
   for(let c=range.s.c;c<=range.e.c;c++){const v=readCell(ws[XLSX.utils.encode_cell({r,c})],date1904,headers[c-range.s.c]);cells.set(headers[c-range.s.c],v);if(v.v!==null&&text(v.v)!=='')filled=true;}
   if(!filled)continue;
   const event=code(ws[XLSX.utils.encode_cell({r,c:ec})]?.v);if(!/^\d+$/.test(event))throw Error(`${source} / ${sn}, fila ${r+1}: falta un código de evento numérico válido. Corrige el archivo y vuelve a cargarlo.`);
   // No omitir eventos válidos por no pertenecer al catálogo de alertas.
   // Se conserva el evento reportado en cod_eve y se toma su nombre de nom_eve cuando exista.
   const row={code:event,cells,source,sourceSheet:sn,sourceRow:r+1};row.name=SPECIAL_EVENTS[event]||text(field(row,['NOMEVE','NOMBREEVENTO','EVENTO']))||known[event]||`Evento ${event}`;row.alert=alertFor(row);rows.push(row);
  }
 }
 return {rows,notes};
}
// Cross-workbook comparison. All data remain in the current page.
const DEFAULT_ERI_CODES=new Set(["200", "205", "230", "250", "270", "290", "295", "310", "350", "360", "380", "390", "400", "410", "412", "440", "500", "570", "610", "670", "710", "720", "730", "770", "452", "535", "307", "365", "607", "725", "275", "349", "739", "355", "800"]);
let transferredEriCatalog=null;
const inputs=[null,null];let result=null,busy=false,view='all',page=0;
const coreFields=['tip_ide_','num_ide_','cod_eve','ini_sin_'];
const meta=h=>(/^(ERI|ALERTA|MOTIVOALERTA|ESTADONSI|MOTIVONSI|ARCHIVOORIGEN|HOJAORIGEN|FILAORIGEN|REVISION|IDCOINCIDENCIA|HOJAFUENTE|FILAFUENTE|CAMPOSCON|CRUCE)/.test(key(h))||h==='FUENTE');
const ignored=new Set(['FECHAHORA','REGINIFEC','FECARCXL','VERSION','VACIO','FECAJU']);
function get(r,k){return field(r,[key(k)]);}
function dateKey(v){const d=v instanceof Date?v:textDate(v);return d&&!isNaN(d)?d.toISOString().slice(0,10):'';}
function identity(r){const t=norm(get(r,'tip_ide_')),d=norm(get(r,'num_ide_')),c=r.code,dt=dateKey(get(r,'ini_sin_'));return !t||!d||missing.has(t)||missing.has(d)||!dt?null:JSON.stringify([t,d,c,dt]);}
function personEvent(r){const t=norm(get(r,'tip_ide_')),d=norm(get(r,'num_ide_'));return t&&d&&!missing.has(t)&&!missing.has(d)?JSON.stringify([t,d,r.code]):null;}
function normalized(c){if(!c)return '';if(c.date)return dateKey(c.v);let v=norm(c.v).replace(/\s+/g,' ');if(/^[\s-]*$/.test(v))return '';return v;}
function discrepancies(rows){const fields=new Map();for(const r of rows)for(const [h,c] of r.cells){if(meta(h)||ignored.has(key(h)))continue;const k=key(h);if(!fields.has(k))fields.set(k,{header:h,values:new Set()});fields.get(k).values.add(normalized(c));}return [...fields.values()].filter(f=>f.values.size>1).map(f=>f.header);}
function compare(a,b,priority){
 const groups=new Map(),pending=[],episodes=new Map();let ix=0;
 for(const [source,rows] of [['A',a],['B',b]])for(const original of rows){const r={...original,from:source};const id=identity(r);if(!id){pending.push(r);continue;}if(!groups.has(id))groups.set(id,{id:'CASO-'+String(++ix).padStart(4,'0'),key:id,code:r.code,name:r.name,rows:[]});groups.get(id).rows.push(r);const pe=personEvent(r);if(!episodes.has(pe))episodes.set(pe,[]);episodes.get(pe).push(r);}
 const list=[...groups.values()];for(const g of list){g.a=g.rows.filter(r=>r.from==='A');g.b=g.rows.filter(r=>r.from==='B');g.shared=!!(g.a.length&&g.b.length);g.diff=discrepancies(g.rows);g.internal=g.a.length>1||g.b.length>1;const preferred=priority==='A'?g.a:g.b;g.chosen=(preferred.length?preferred:g.rows)[0];
 const peers=episodes.get(personEvent(g.chosen));g.episode=peers.some(r=>r.from!==g.chosen.from&&identity(r)!==g.key);
 g.status=g.shared?'COMPARTIDO A/B':g.a.length?'SOLO INMEDIATA (A)':'SOLO SUPER INMEDIATA (B)';
 g.review=[g.diff.length?'Diferencias: '+g.diff.join(', '):'',g.episode?'Misma persona y evento con otra fecha de inicio: verificar episodio; se conserva por separado.':'',g.internal?'Más de una fila de este caso dentro de un archivo.':''].filter(Boolean).join(' | ');
 }
 return {groups:list,pending,priority,aCount:a.length,bCount:b.length};
}
async function readBook(bytes){
 const u=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);
 const original=XLSX.read(bytes,{type:'array',cellDates:false,cellNF:true});
 if(u[0]!==80||u[1]!==75)return original;
 const zip=await JSZip.loadAsync(u);let changed=false;const date1904=!!original.Workbook?.WBProps?.date1904;
 // Read ISO date cells directly to avoid timezone drift in older XLSX readers.
 for(const entry of Object.values(zip.files)){
  if(entry.dir||!/^xl\/worksheets\/.*\.xml$/.test(entry.name))continue;
  let xml=await entry.async('string'),edited=false;
  xml=xml.replace(/(<(?:[\w.-]+:)?c\b[^>]*\bt=")d("[^>]*>)([\s\S]*?)(<\/(?:[\w.-]+:)?c>)/g,(whole,start,attrs,body,end)=>{
   const m=body.match(/(<(?:[\w.-]+:)?v>)([^<]+)(<\/(?:[\w.-]+:)?v>)/);if(!m)return whole;
   const iso=m[2].trim();const dt=new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso)?iso+'T00:00:00Z':/[zZ]|[+-]\d{2}:\d{2}$/.test(iso)?iso:iso+'Z');if(isNaN(dt))return whole;
   const serial=(dt.getTime()-Date.UTC(1899,11,30))/86400000-(date1904?1462:0);edited=true;
   return start+'n'+attrs+body.replace(m[0],m[1]+serial+m[3])+end;
  });
  if(edited){zip.file(entry.name,xml);changed=true;}
 }
 return changed?XLSX.read(await zip.generateAsync({type:'uint8array'}),{type:'array',cellDates:false,cellNF:true}):original;
}
async function sheetOptions(bytes){const w=await readBook(bytes);const cats=['NUEVOS','ACTUALIZADOS','YAREGISTRADOS','PORVERIFICAR','REPETIDOSBASE'];const hasCats=w.SheetNames.some(n=>cats.includes(key(n)));const data=w.SheetNames.filter(n=>!['RESUMEN','DIFERENCIAS'].includes(key(n)));const events=data.filter(n=>/^\d+(?:[ _-]|$)/.test(n));return {book:w,names:w.SheetNames,selected:new Set(hasCats?data.filter(n=>cats.includes(key(n))):events.length?events:data.filter(n=>!['PRELIMINAR','HISTORICO'].includes(key(n))))};}
function chosenRows(i){const input=inputs[i];const names=[...$('sheets'+i).querySelectorAll('input:checked')].map(e=>e.value);if(!names.length)throw Error('Selecciona al menos una hoja en el archivo '+(i===0?'A':'B')+'.');const slim={...input.book,SheetNames:names,Sheets:Object.fromEntries(names.map(n=>[n,input.book.Sheets[n]]))};const parsed=parseBook(slim,input.filename);
 if(!parsed.rows.length)throw Error('El archivo '+(i===0?'A':'B')+' no contiene registros con cod_eve en las hojas seleccionadas.');
 if(i===0){
   const allowed=transferredEriCatalog||DEFAULT_ERI_CODES;
   const before=parsed.rows.length;
   parsed.rows=parsed.rows.filter(r=>allowed.has(r.code));
   const excluded=before-parsed.rows.length;
   if(excluded)parsed.notes.push('Inmediata A: '+excluded+' registro(s) fuera del catálogo ERI, excluidos únicamente de A. Súper inmediata B no se filtra por catálogo.');
   if(!parsed.rows.length)throw Error('El archivo de Inmediata (A) no contiene eventos pertenecientes al catálogo ERI ('+allowed.size+' códigos). La fuente B admite todos los códigos válidos.');
 }
 return {...parsed,names};}
function invalidate(){result=null;$('results').hidden=true;$('download').disabled=true;$('excel').disabled=true;}
function status(t,error=false){$('status').textContent=t;$('status').className='status'+(error?' error':'');}
function buttons(b){busy=b;['file0','file1','run','reset','priority'].forEach(id=>$(id).disabled=b);$('run').disabled=b||!inputs.every(Boolean);$('download').disabled=b||!result;$('excel').disabled=b||!result;for(let i=0;i<2;i++)$('sheets'+i).querySelectorAll('input').forEach(e=>e.disabled=b);}
async function load(i,file){invalidate();if(i===0)transferredEriCatalog=null;inputs[i]=null;$('sheets'+i).innerHTML='';buttons(true);try{if(!file) return;status('Leyendo '+file.name+'…');const bytes=await file.arrayBuffer();const info=await sheetOptions(bytes);if(!info.selected.size&&info.names.length)info.selected.add(info.names[0]);inputs[i]={...info,filename:file.name};$('filename'+i).textContent=file.name;$('sheets'+i).innerHTML=info.names.map(n=>`<label class="sheet"><input type="checkbox" value="${esc(n)}" ${info.selected.has(n)?'checked':''}> ${esc(n)}</label>`).join('');$('sheets'+i).querySelectorAll('input').forEach(e=>e.onchange=()=>{invalidate();status('Cambió la selección de hojas. Pulsa Cruzar archivos.');});status('Archivo '+(i===0?'A':'B')+' cargado. Revisa las hojas seleccionadas.');}catch(e){status('No se pudo leer el archivo: '+e.message,true);}finally{buttons(false);}}
function run(){invalidate();buttons(true);try{const a=chosenRows(0),b=chosenRows(1);result=compare(a.rows,b.rows,$('priority').value);result.notes=[...a.notes,...b.notes];result.sheets=[a.names,b.names];result.notes.unshift('A (solo catálogo ERI) + B (todos los códigos válidos de Excel) = C · Filas conservadas: '+itemsFor(result,'Consolidado sin repetidos').length);view='all';page=0;render();status('Cruce terminado. La exportación incluye todos los resultados, aunque filtres la vista.');}catch(e){invalidate();status(e.message,true);}finally{buttons(false);}}
function render(){const r=result,g=r.groups;$('results').hidden=false;$('stats').innerHTML=[['Repetidos entre archivos',g.filter(x=>x.shared).length],['Solo Inmediata (A)',g.filter(x=>!x.shared&&x.a.length).length],['Solo Super inmediata (B)',g.filter(x=>!x.shared&&x.b.length).length],['Filas sin clave completa',r.pending.length]].map(([label,n])=>`<div class="stat"><b>${n}</b><span>${label}</span></div>`).join('');const events=[...new Map(g.map(x=>[x.code,x.name])).entries()].sort((a,b)=>Number(a[0])-Number(b[0]));$('events').innerHTML='<option value="all">Todos los eventos</option>'+events.map(([c,n])=>`<option value="${c}">${esc(c+' · '+n)}</option>`).join('');$('notes').textContent='Filas cargadas: '+r.aCount+' en A y '+r.bCount+' en B. Casos con diferencias: '+g.filter(x=>x.diff.length).length+'. Casos con varias filas dentro de un archivo: '+g.filter(x=>x.internal).length+'.\n'+r.notes.join('\n');renderTable();}
function renderTable(){if(!result)return;const q=norm($('search').value),filter=$('filter').value,ev=$('events').value;let gs=result.groups.filter(g=>(ev==='all'||g.code===ev)&&(filter==='all'||filter==='repeat'&&g.shared||filter==='a'&&!g.shared&&g.a.length||filter==='b'&&!g.shared&&g.b.length||filter==='diff'&&(g.diff.length||g.episode))&&(!q||norm(g.rows.map(r=>[...r.cells.values()].map(showCell).join(' ')).join(' ')).includes(q)));gs=groupedColorRows(gs,g=>g.code,groupAlert);const pages=Math.max(1,Math.ceil(gs.length/40));page=Math.min(page,pages-1);$('body').innerHTML=gs.slice(page*40,page*40+40).map(g=>{const r=g.chosen;return `<tr class="${groupAlert(g).kind!=='normal'?'alert-'+groupAlert(g).kind:g.diff.length||g.episode?'review':g.shared?'repeat':''}"><td>${esc(groupAlert(g).label)}</td><td>${esc(groupAlert(g).reason)}</td><td>${esc(g.status)}</td><td>${esc(g.id)}</td><td>${esc(g.code+' · '+g.name)}</td><td>${esc(get(r,'tip_ide_')+' '+get(r,'num_ide_'))}</td><td>${esc(['pri_nom_','seg_nom_','pri_ape_','seg_ape_'].map(k=>get(r,k)).filter(Boolean).join(' '))}</td><td>${esc(showCell([...r.cells.entries()].find(([h])=>key(h)==='INISIN')?.[1]))}</td><td>${g.a.length}</td><td>${g.b.length}</td><td>${esc(g.review||'Sin diferencias en campos comparables')}</td><td><button class="secondary" data-id="${g.id}">Ver versiones</button></td></tr>`}).join('');$('body').querySelectorAll('button').forEach(b=>b.onclick=()=>detail(b.dataset.id));$('pageInfo').textContent=`${gs.length} casos · Página ${page+1} de ${pages}`;$('prev').disabled=page===0;$('next').disabled=page===pages-1;
 $('pendingBox').hidden=!result.pending.length;$('pending').textContent=result.pending.map(r=>`${r.from} · ${r.sourceSheet} · fila ${r.sourceRow} · evento ${r.code} · ${get(r,'tip_ide_')} ${get(r,'num_ide_')}: falta documento, tipo o fecha válida de inicio.`).join('\n');}
function detail(id){const g=result.groups.find(g=>g.id===id);$('detailTitle').textContent=id+' · '+g.name;const hs=[...new Set(g.rows.flatMap(r=>[...r.cells.keys()]))];$('detailTable').innerHTML='<thead><tr><th>Campo</th>'+g.rows.map(r=>`<th>Archivo ${r.from} · ${esc(r.sourceSheet)} · fila ${r.sourceRow}</th>`).join('')+'</tr></thead><tbody>'+hs.map(h=>`<tr class="${g.diff.some(d=>key(d)===key(h))?'review':''}"><td>${esc(h)}</td>${g.rows.map(r=>`<td>${esc(showCell(r.cells.get(h)))}</td>`).join('')}</tr>`).join('')+'</tbody>';$('detail').showModal();}
function dateStamp(){return new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Bogota',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
function columns(rows){return [...new Set(rows.flatMap(x=>[...x.row.cells.keys()]))];}
function header(s){s.getRow(1).height=34;s.getRow(1).eachCell(c=>{c.font={bold:true,color:{argb:'FFFFFFFF'}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF163A5F'}};c.alignment={wrapText:true,vertical:'middle'};});}
function addRows(wb,name,items){const s=wb.addWorksheet(name.slice(0,31),{views:[{state:'frozen',ySplit:1}]});const hs=columns(items),prefix=['CRUCE_ESTADO','CRUCE_REVISION','CRUCE_ID','CRUCE_ARCHIVO','CRUCE_HOJA','CRUCE_FILA'];for(let i=0;i<prefix.length;i++)while(hs.includes(prefix[i]))prefix[i]+='_NUEVO';s.addRow([...prefix,...hs]);
 for(const item of items){const {row:r,group:g}=item;const pending=!g;const er=s.addRow([pending?'SIN CLAVE COMPLETA':g.status,pending?'No se elimina: falta tipo, documento o fecha de inicio válida.':g.review,pending?'PENDIENTE':g.id,r.from+' · '+r.source,r.sourceSheet,r.sourceRow,...hs.map(h=>r.cells.get(h)?.v??null)]);er.eachCell({includeEmpty:true},(c,i)=>{if(pending||g.diff.length||g.episode)c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFFFF2CC'}};else if(g.shared)c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFE6F0FF'}};if(i>6){const v=r.cells.get(hs[i-7]);if(v?.date)c.numFmt='dd/mm/yyyy';else if(typeof v?.v==='number'&&v.z)c.numFmt=v.z;}});}
 s.columns.forEach((c,i)=>c.width=i===1?65:i===3?38:i<6?22:Math.min(35,Math.max(15,hs[i-6]?.length+2||15)));header(s);s.autoFilter={from:{row:1,column:1},to:{row:Math.max(1,s.rowCount),column:prefix.length+hs.length}};return s;
}
function summary(wb,r,mode){const s=wb.addWorksheet('Resumen');s.addRow(['Evento','Nombre','Repetidos A/B','Solo A','Solo B','Casos únicos con clave','Con diferencias']);const es=[...new Set(r.groups.map(g=>g.code))].sort((a,b)=>Number(a)-Number(b));for(const c of es){const gs=r.groups.filter(g=>g.code===c);s.addRow([c,gs[0].name,gs.filter(g=>g.shared).length,gs.filter(g=>!g.shared&&g.a.length).length,gs.filter(g=>!g.shared&&g.b.length).length,gs.length,gs.filter(g=>g.diff.length).length]);}s.addRow(['TOTAL','',r.groups.filter(g=>g.shared).length,r.groups.filter(g=>!g.shared&&g.a.length).length,r.groups.filter(g=>!g.shared&&g.b.length).length,r.groups.length,r.groups.filter(g=>g.diff.length).length]);s.addRow([]);
 for(const [a,b] of [['Contenido',mode],['Clave','Tipo y número de documento + evento + fecha de inicio de síntomas. No se cruza solo por apellidos.'],['Archivo A',inputs[0]?.filename||'A'],['Archivo B',inputs[1]?.filename||'B'],['Hojas A',r.sheets?.[0]?.join(' | ')||''],['Hojas B',r.sheets?.[1]?.join(' | ')||''],['Versión conservada','Primera fila del archivo '+r.priority+' para cada clave; si no existe allí, primera fila del otro archivo. No se fusionan campos.'],['Casos con diferencias','Se conserva una versión marcada en el consolidado. Todas las versiones aparecen en Repetidos. Requieren revisión.'],['Filas sin clave',r.pending.length+' filas se conservan sin deduplicar y se marcan. No se agrupan por nombre.'],['Distinta fecha de inicio','Misma persona/evento con otra fecha se conserva como clave distinta y se marca para verificar episodio.'],['Comparación de datos','Compara campos presentes en al menos dos versiones. Omite metadatos de revisión/exportación, FechaHora, RegIniFec, fec_arc_xl, version, vacio y fec_aju_.'],['Colores','Amarillo: diferencias o revisión. Azul claro: repetido sin diferencias en campos comparables.']])s.addRow([a,b]);s.columns=[{width:28},{width:110},...Array.from({length:5},()=>({width:22}))];s.eachRow(row=>{row.alignment={wrapText:true,vertical:'top'};if(row.number>es.length+3)row.height=45;});header(s);}
function workbookFor(r,mode){const w=new ExcelJS.Workbook();summary(w,r,mode);let items=[];
 for(const g of r.groups){let rows=[];if(mode==='Consolidado sin repetidos')rows=[g.chosen];if(mode==='Repetidos y diferencias'&&(g.shared||g.internal||g.episode))rows=g.rows;if(mode==='Exclusivos de A'&&!g.shared&&g.a.length)rows=[g.chosen];if(mode==='Exclusivos de B'&&!g.shared&&g.b.length)rows=[g.chosen];items.push(...rows.map(row=>({row,group:g})));}
 if(mode==='Consolidado sin repetidos')items.push(...r.pending.map(row=>({row,group:null})));
 for(const code of [...new Set(items.map(i=>i.row.code))].sort((a,b)=>Number(a)-Number(b))){const rs=items.filter(i=>i.row.code===code);addRows(w,(code+'_'+rs[0].row.name).replace(/[\\/*?:\[\]]/g,' ').slice(0,31),rs);}
 return w;
}
function save(bytes,name,mime){const u=URL.createObjectURL(new Blob([bytes],{type:mime})),a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),60000);}
async function exportAll(zipMode){if(!result||busy)return;buttons(true);status('Preparando los Excel…');await new Promise(r=>setTimeout(r,0));try{const stamp=dateStamp();if(zipMode){const z=new JSZip(),f=z.folder('Cruce_'+stamp);for(const [mode,name] of [['Consolidado sin repetidos','01_Consolidado_sin_repetidos'],['Repetidos y diferencias','02_Repetidos_y_diferencias'],['Exclusivos de A','03_Solo_archivo_A'],['Exclusivos de B','04_Solo_archivo_B']])f.file(name+'.xlsx',await workbookFor(result,mode).xlsx.writeBuffer());save(await z.generateAsync({type:'uint8array',compression:'DEFLATE'}),'Cruce_'+stamp+'.zip','application/zip');}else save(await workbookFor(result,'Consolidado sin repetidos').xlsx.writeBuffer(),'Consolidado_sin_repetidos_'+stamp+'.xlsx','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');status('Descarga preparada. Revisa los casos señalados con diferencias.');}catch(e){status('Error al exportar: '+e.message,true);}finally{buttons(false);}}
for(let i=0;i<2;i++)$('file'+i).onchange=e=>load(i,e.target.files[0]);$('run').onclick=run;$('priority').onchange=()=>{invalidate();status('Cambió la prioridad. Pulsa Cruzar archivos.');};$('reset').onclick=()=>{inputs.fill(null);for(let i=0;i<2;i++){$('file'+i).value='';$('filename'+i).textContent='';$('sheets'+i).innerHTML='';}$('search').value='';invalidate();buttons(false);status('Carga los dos Excel para comenzar.');};for(const id of ['events','filter','search'])$(id).oninput=()=>{page=0;renderTable();};$('prev').onclick=()=>{page--;renderTable();};$('next').onclick=()=>{page++;renderTable();};$('closeDetail').onclick=()=>$('detail').close();$('download').onclick=()=>exportAll(true);$('excel').onclick=()=>exportAll(false);buttons(false);

const alertColors={population:'FFDCF3E4',both:'FFEEE1FA',critical:'FFFFE1E5',indigenous:'FFEEE1FA',foreign:'FFFFE5CC',verify:'FFFFF2CC'};
function groupAlert(g){const alerts=g.rows.map(alertFor),populations=[...new Set(alerts.flatMap(a=>a.populations))],eventCriteria=[...new Set(alerts.flatMap(a=>a.eventCriteria))];const kind=populations.length&&eventCriteria.length?'both':populations.length?'population':eventCriteria.length?'critical':alerts.some(a=>a.kind==='verify')?'verify':'normal';return {kind,populations,eventCriteria,label:{both:'POBLACIÓN + EVENTO',population:'POBLACIÓN ESPECIAL',critical:'CRITERIO DE EVENTO',verify:'VERIFICAR',normal:''}[kind],reason:[...new Set(alerts.filter(a=>a.kind!=='normal').map(a=>a.reason))].join(' | ')};}
addRows=function(wb,name,items){items=groupedColorRows(items,i=>i.row.code,i=>i.group?groupAlert(i.group):alertFor(i.row));
 const s=wb.addWorksheet(name.slice(0,31),{views:[{state:'frozen',ySplit:1}]});const hs=columns(items),prefix=['ALERTA_EVENTO','MOTIVO_ALERTA','CRUCE_ESTADO','CRUCE_REVISION','CRUCE_ID','CRUCE_ARCHIVO','CRUCE_HOJA','CRUCE_FILA'];const n=prefix.length;
 const generated=prefix.map(h=>{while(hs.includes(h))h+='_NUEVO';return h});s.addRow([...generated,...hs]);
 for(const item of items){const {row:r,group:g}=item,a=g?groupAlert(g):alertFor(r);const pending=!g&&!item.audit;
 let state=item.audit||(!g?'SIN CLAVE COMPLETA':g.status),review=item.reason||(pending?'No se elimina: falta tipo, documento o fecha de inicio válida.':g?.review||'');
 const er=s.addRow([a.label,a.reason,state,review,g?.id||'',sourceName(r.from)+' · '+r.source,r.sourceSheet,r.sourceRow,...hs.map(h=>r.cells.get(h)?.v??null)]);
 er.eachCell({includeEmpty:true},(c,i)=>{const color=alertColors[a.kind]||(pending||g?.diff.length||g?.episode?'FFFFF2CC':g?.shared?'FFE6F0FF':null);if(color)c.fill={type:'pattern',pattern:'solid',fgColor:{argb:color}};if(i<=2)c.font={bold:!!a.label};if(i>n){const v=r.cells.get(hs[i-n-1]);if(v?.date||v?.v instanceof Date)c.numFmt='dd/mm/yyyy';else if(typeof v?.v==='number'&&v.z)c.numFmt=v.z;}});
 }
 s.columns.forEach((c,i)=>c.width=[22,65,30,65,20,40,28,16][i]||Math.min(35,Math.max(15,(hs[i-n]?.length||13)+2)));header(s);s.autoFilter={from:{row:1,column:1},to:{row:Math.max(1,s.rowCount),column:n+hs.length}};return s;
};
// A se limita al catálogo ERI (o el personalizado recibido); B incorpora todos los eventos de Excel. No se filtra C por catálogo.
const sourceName=s=>s==='A'?'Inmediata (A)':'Super inmediata (B)';
sheetOptions=async function(bytes){const w=await readBook(bytes);const eventNames=w.SheetNames.filter(n=>/^\d+(?:[ _-]|$)/.test(n));const categories=['NUEVOS','ACTUALIZADOS','PORVERIFICAR'];const selected=eventNames.length?eventNames:w.SheetNames.some(n=>categories.includes(key(n)))?w.SheetNames.filter(n=>categories.includes(key(n))):w.SheetNames.filter(n=>!['RESUMEN','DIFERENCIAS','PRELIMINAR','HISTORICO','EXCLUIDOS','YAREGISTRADOS','REPETIDOSBASE'].includes(key(n)));return {book:w,names:w.SheetNames,selected:new Set(selected)};};
function itemsFor(r,mode){const items=[];for(const g of r.groups){if(mode==='Consolidado sin repetidos')items.push({row:g.chosen,group:g});else if(mode==='Repetidos y diferencias'&&(g.shared||g.internal||g.episode))items.push(...g.rows.map(row=>({row,group:g})));}if(mode==='Consolidado sin repetidos')items.push(...r.pending.map(row=>({row,group:null})));return items;}
summary=function(w,r,mode){const s=w.addWorksheet('Resumen');s.addRow(['Evento','Nombre','Casos con clave en C','Compartidos A/B','Repetidos internos','Con diferencias','Filas sin clave']);const codes=[...new Set([...r.groups.map(g=>g.code),...r.pending.map(x=>x.code)])].sort((a,b)=>Number(a)-Number(b));for(const c of codes){const gs=r.groups.filter(g=>g.code===c),ps=r.pending.filter(x=>x.code===c);s.addRow([c,gs[0]?.name||ps[0]?.name,gs.length,gs.filter(g=>g.shared).length,gs.filter(g=>g.internal).length,gs.filter(g=>g.diff.length).length,ps.length]);}s.addRow(['TOTAL','',r.groups.length,r.groups.filter(g=>g.shared).length,r.groups.filter(g=>g.internal).length,r.groups.filter(g=>g.diff.length).length,r.pending.length]);s.addRow([]);
 for(const [a,b] of [['Contenido',mode],['Inmediata (A)',inputs[0]?.filename||'Resultado del procesador ERI'],['Super inmediata (B)',inputs[1]?.filename||'Resultado del organizador NSI'],['Operación','A + B = C. Incluye casos exclusivos de ambas fuentes y una sola versión de cada caso repetido, aunque no tenga cambios. A incorpora únicamente el catálogo ERI y B todos los eventos válidos de los Excel. C conserva la unión, incluidos eventos exclusivos de B. Sin filtros adicionales por fecha o ajuste.'],['Clave','Tipo y número de documento + evento + fecha de inicio de síntomas. No se deduplica por apellidos.'],['Versión conservada','Primera fila de '+sourceName(r.priority)+' para cada clave; si no existe, primera fila de la otra fuente. No se fusionan valores.'],['Diferencias','El caso sigue en la pestaña de su evento en C. Las versiones originales se conservan en Repetidos y diferencias, también por evento.'],['Sin clave completa',r.pending.length+' filas conservadas sin eliminación automática: requieren revisión.'],['Otra fecha de inicio','Se conserva como episodio separado y se marca para revisión. No se afirma que sea un repetido confirmado.'],['Alertas','Primeras columnas y colores: poblaciones especiales en todos los eventos; tos ferina indígena; sarampión exterior o notificado en Amazonas; difteria y ébola; encefalitis equina del este en humanos; cólera y rabia humana, con las denominaciones propias de 570 y 307. Se revisan todas las versiones.'],['Colores','Verde: población especial. Rosa: criterio de evento. Morado: ambos criterios. Amarillo: verificar. Azul: repetido sin diferencias.']]){const row=s.addRow([a,b]);row.height=52;row.alignment={wrapText:true,vertical:'top'};}s.columns=[{width:28},{width:110},...Array.from({length:5},()=>({width:24}))];header(s);};
workbookFor=function(r,mode){const w=new ExcelJS.Workbook();summary(w,r,mode);const items=itemsFor(r,mode);for(const c of [...new Set(items.map(i=>i.row.code))].sort((a,b)=>Number(a)-Number(b))){const rs=items.filter(i=>i.row.code===c);addRows(w,eventSheetName(rs),rs);}return w;};
function eventSheetName(rs){return (rs[0].row.code+'_'+rs[0].row.name).replace(/[\\/*?:\[\]]/g,' ').slice(0,31);}
async function packageFor(r){const z=new JSZip(),f=z.folder('Consolidado_C_'+dateStamp());f.file('C_Consolidado_sin_repetidos.xlsx',await workbookFor(r,'Consolidado sin repetidos').xlsx.writeBuffer());f.file('Repetidos_y_diferencias.xlsx',await workbookFor(r,'Repetidos y diferencias').xlsx.writeBuffer());
 for(const [mode,folder] of [['Consolidado sin repetidos','C_por_evento'],['Repetidos y diferencias','Repetidos_por_evento']]){const items=itemsFor(r,mode);for(const c of [...new Set(items.map(i=>i.row.code))].sort((a,b)=>Number(a)-Number(b))){const rs=items.filter(i=>i.row.code===c),name=eventSheetName(rs),w=new ExcelJS.Workbook();addRows(w,name,rs);f.folder(folder).file(name+'.xlsx',await w.xlsx.writeBuffer());}}
 f.file('LEEME.txt','Inmediata (A) + Super inmediata (B) = Consolidado (C). C contiene una versión por tipo/documento/evento/fecha de inicio. Los casos compartidos sin cambios también quedan una vez en C. Las diferencias se señalan en la pestaña correspondiente y todas las versiones figuran en Repetidos_y_diferencias. Las fechas de inicio distintas requieren revisar si se trata de otro episodio. Si faltan datos de la clave, se conservan las filas sin deduplicar automáticamente. Inmediata (A) se limita a eventos del catálogo ERI, Super inmediata (B) conserva todos sus códigos válidos; C une ambos sin filtros adicionales de fecha ni ajuste. Fechas día/mes/año y alertas en las primeras columnas. Los originales no se modifican.');return z.generateAsync({type:'uint8array',compression:'DEFLATE'});}
exportAll=async function(zipMode){if(!result||busy)return;buttons(true);status('Preparando C y los informes por evento…');await new Promise(r=>setTimeout(r,0));try{if(zipMode)save(await packageFor(result),'Consolidado_C_'+dateStamp()+'.zip','application/zip');else save(await workbookFor(result,'Consolidado sin repetidos').xlsx.writeBuffer(),'C_Consolidado_sin_repetidos_'+dateStamp()+'.xlsx','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');status('Descarga preparada: una versión por caso con clave completa. Revisa las diferencias y los registros sin clave.');}catch(e){status(e.message,true)}finally{buttons(false)}};
const originalRender=render;
render=function(){originalRender();const r=result;$('stats').innerHTML=[['Filas en C',r.groups.length+r.pending.length],['Casos compartidos A/B',r.groups.filter(g=>g.shared).length],['Casos con diferencias',r.groups.filter(g=>g.diff.length).length],['Filas sin clave completa',r.pending.length]].map(([label,n])=>`<div class="stat"><b>${n}</b><span>${label}</span></div>`).join('');};
window.receiveTransfer=async(bytes,filename,target,date,catalog)=>{
 if(busy)throw Error('El cruce está ocupado. Intenta de nuevo al terminar.');
 const i=target==='B'?1:0;$('file'+i).value='';
 await load(i,{name:filename,arrayBuffer:async()=>bytes});
 if(i===0&&Array.isArray(catalog)&&catalog.length){
   transferredEriCatalog=new Set(catalog.map(x=>code(x.codigo)).filter(x=>/^\d+$/.test(x)));
 }
};

// Compact exported data sheets without deleting columns or changing cell values.
function compactEventSheet(ws){
 const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]/g,'');
 const names=ws.getRow(1).values.slice(1).map(String);
 if(!names.some(h=>['CODEVE','CODIGOEVENTO','CODIGODELEVENTO'].includes(normalize(h))))return ws;
 function cellText(c){const v=c.value;if(v==null)return '';if(v instanceof Date)return '00/00/0000';return typeof v==='object'?c.text||'':String(v);}
 ws.columns.forEach((col,i)=>{const label=names[i]||'',k=normalize(label);let longest=0,filled=0;
  col.eachCell({includeEmpty:false},(c,row)=>{if(row===1)return;const s=cellText(c);if(s.trim()){filled++;longest=Math.max(longest,...s.split(/\r?\n/).map(t=>t.length));}});
  const audit=/^(ALERTA|ERI|ESTADONSI|MOTIVONSI|CRUCE|ARCHIVOORIGENNSI|HOJAORIGENNSI|FILAORIGENNSI|MOTIVOALERTA)/.test(k);
  const isDate=/^(FEC|FECHA)/.test(k)||['INISIN','REGINIFEC'].includes(k);
  const max=audit?(/MOTIVO|CAMBIOS|REVISION|ALERTA/.test(k)?30:22):30;
  const headerHint=Math.min(label.length+1,audit?14:18);
  col.width=isDate?12:filled?Math.min(max,Math.max(9,headerHint,longest+2)):Math.min(12,Math.max(9,headerHint));
 });
 ws.getRow(1).height=32;
 ws.eachRow((row,index)=>{let lines=1;row.eachCell({includeEmpty:true},(c,col)=>{c.alignment={...c.alignment,vertical:'top',wrapText:true};c.font={...c.font,size:10};if(index>1){const width=Math.max(7,ws.getColumn(col).width-2);lines=Math.max(lines,Math.min(3,cellText(c).split(/\r?\n/).reduce((n,s)=>n+Math.max(1,Math.ceil(s.length/width)),0)));}});if(index>1)row.height=Math.max(15,lines*14);});
 return ws;
}

const fullCrossSheet=addRows;addRows=function(w,n,items){return compactEventSheet(fullCrossSheet(w,n,items));};
// Sort presentation copies only; original selection and deduplication order stay intact.
function groupedColorRows(rows,eventOf,alertOf){
 const ranks={both:0,population:1,indigenous:1,foreign:1,critical:2,verify:3,normal:4};
 return rows.map((row,index)=>{const a=alertOf(row);return {row,index,event:String(eventOf(row)||''),rank:ranks[a.kind]??4,pop:(a.populations||[]).map(p=>p.split(' · ')[0]).sort().join('|')};}).sort((a,b)=>a.event.localeCompare(b.event,'es',{numeric:true})||a.rank-b.rank||a.pop.localeCompare(b.pop,'es')||a.index-b.index).map(x=>x.row);
}
